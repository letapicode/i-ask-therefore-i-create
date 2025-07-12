import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import { logAudit } from '../../../../packages/shared/src/audit';
import { policyMiddleware } from '../../../../packages/shared/src/policyMiddleware';

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

app.post('/slack', async (req, res) => {
  const user = req.body.user_id as string;
  const text = (req.body.text as string) || '';
  const ctx = readContext();
  const [cmd, arg] = text.trim().split(/\s+/);
  let jobId = arg || ctx[user];
  let message = '';
  try {
    if (cmd === 'redeploy' && jobId) {
      await fetch(`${ORCH_URL}/api/redeploy/${jobId}`, {
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
      ctx[user] = jobId;
      saveContext(ctx);
      message = `Redeploy triggered for job ${jobId}`;
    } else if (cmd === 'status' && jobId) {
      const resp = await fetch(`${ORCH_URL}/api/status/${jobId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
      const data = await resp.json();
      ctx[user] = jobId;
      saveContext(ctx);
      message = `Job ${jobId} status: ${data.status}`;
    } else {
      message = 'Usage: redeploy <jobId> | status <jobId>';
    }
  } catch {
    message = 'Error processing command';
  }
  res.json({ text: message });
});

export function start(port = 3014) {
  app.listen(port, () => console.log(`chatops service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3014);
}
