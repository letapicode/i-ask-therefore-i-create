import express from 'express';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { initSentry } from '../../packages/shared/src/sentry';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`pair-chat ${req.method} ${req.url}`);
  next();
});

const PATCH_DIR = process.env.PATCH_DIR || '.patches';

async function sendToModel(prompt: string) {
  if (process.env.CUSTOM_MODEL_URL) {
    const r = await fetch(process.env.CUSTOM_MODEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const j = await r.json();
    return j.result as string;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

app.post('/applyPatch', (req, res) => {
  const patch = req.body.patch;
  if (!patch) return res.status(400).json({ error: 'missing patch' });
  if (!fs.existsSync(PATCH_DIR)) fs.mkdirSync(PATCH_DIR);
  const file = path.join(PATCH_DIR, `${Date.now()}.patch`);
  fs.writeFileSync(file, patch, 'utf8');
  if (!process.env.TEST_MODE) {
    try {
      execSync(`git apply ${file}`);
      execSync('git add -A');
      execSync('git commit -m "chat patch"');
    } catch (err) {
      return res.status(500).json({ error: 'apply failed' });
    }
  }
  res.json({ ok: true });
});

export function start(port = 4002) {
  initSentry('pair-chat');
  const server = app.listen(port, () =>
    console.log(`pair-chat listening on ${port}`)
  );
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    ws.on('message', async (msg) => {
      try {
        const { type, file, message } = JSON.parse(msg.toString());
        if (type !== 'ask') return;
        let snippet = '';
        if (file && fs.existsSync(file)) {
          snippet = fs.readFileSync(file, 'utf8');
        }
        const prompt = `${message}\n\nCurrent code from ${file}:\n${snippet}\n`;
        const result = await sendToModel(prompt);
        ws.send(JSON.stringify({ type: 'response', text: result }));
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: 'failed' }));
      }
    });
  });
  return server;
}

if (require.main === module) {
  start(Number(process.env.PORT) || 4002);
}
