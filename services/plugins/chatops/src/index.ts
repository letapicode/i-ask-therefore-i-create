import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import { logAudit } from '../../../../packages/shared/src/audit';
import { policyMiddleware } from '../../../../packages/shared/src/policyMiddleware';
import { parseMessage } from './nlp';

export const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`chatops ${req.method} ${req.url}`);
  next();
});

const CONTEXT_FILE = process.env.CHATOPS_CONTEXT || '.chatops.json';
const ORCH_URL = process.env.ORCH_URL || 'http://localhost:3002';
const TENANT_ID = process.env.CHATOPS_TENANT || 'chatops';
const ANALYTICS_URL = process.env.ANALYTICS_URL;

interface Context {
  [user: string]: string;
}

function readContext(): Context {
  if (!fs.existsSync(CONTEXT_FILE)) return {};
  return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
}

function saveContext(ctx: Context) {
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(ctx, null, 2));
}

function sendChat(role: string, content: string, user: string) {
  if (!ANALYTICS_URL) return;
  fetch(`${ANALYTICS_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content, user }),
  }).catch(() => {});
}

function updateContextAnalytics(user: string, jobId: string) {
  if (!ANALYTICS_URL) return;
  fetch(`${ANALYTICS_URL}/chatContext`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, jobId }),
  }).catch(() => {});
}

app.post('/slack', async (req, res) => {
  const user = req.body.user_id as string;
  const text = (req.body.text as string) || '';
  const ctx = readContext();
  const { intent, jobId } = parseMessage(text, ctx[user]);
  let resolvedId = jobId;
  let message = '';
  try {
    if (intent === 'redeploy' && resolvedId) {
      await fetch(`${ORCH_URL}/api/redeploy/${resolvedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID,
        },
        body: JSON.stringify({
          description: 'ChatOps redeploy',
          language: 'node',
        }),
      });
      ctx[user] = resolvedId;
      saveContext(ctx);
      updateContextAnalytics(user, resolvedId);
      message = `Redeploy triggered for job ${resolvedId}`;
    } else if (intent === 'status' && resolvedId) {
      const resp = await fetch(`${ORCH_URL}/api/status/${resolvedId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
      const data = await resp.json();
      ctx[user] = resolvedId;
      saveContext(ctx);
      updateContextAnalytics(user, resolvedId);
      message = `Job ${resolvedId} status: ${data.status}`;
    } else {
      message = 'Usage: redeploy <jobId> | status <jobId>';
    }
  } catch {
    message = 'Error processing command';
  }
  sendChat('user', text, user);
  sendChat('assistant', message, user);
  res.json({ text: message });
});

app.post('/api/chatops/nlp', (req, res) => {
  const { user = 'unknown', text = '' } = req.body as {
    user?: string;
    text?: string;
  };
  const ctx = readContext();
  const result = parseMessage(text, ctx[user]);
  if (result.jobId) {
    ctx[user] = result.jobId;
    saveContext(ctx);
    updateContextAnalytics(user, result.jobId);
  }
  sendChat('user', text, user);
  res.json(result);
});

export function start(port = 3014) {
  app.listen(port, () => console.log(`chatops service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3014);
}
