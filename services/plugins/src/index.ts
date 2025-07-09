import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`plugins ${req.method} ${req.url}`);
  next();
});

const DB = process.env.PLUGINS_DB || '.plugin-meta.json';
const MARKETPLACE_URL = process.env.MARKETPLACE_URL || 'http://localhost:3005';

interface PluginMeta {
  name: string;
  installs: number;
  ratings: number[];
}

function read(): PluginMeta[] {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function save(list: PluginMeta[]) {
  fs.writeFileSync(DB, JSON.stringify(list, null, 2));
}

function find(name: string, list: PluginMeta[]) {
  let p = list.find((pl) => pl.name === name);
  if (!p) {
    p = { name, installs: 0, ratings: [] };
    list.push(p);
  }
  return p;
}

app.post('/install', async (req, res) => {
  const { name, licenseKey } = req.body as { name?: string; licenseKey?: string };
  if (!name) return res.status(400).json({ error: 'missing name' });
  // verify license if plugin has a price
  try {
    const check = await fetch(
      `${MARKETPLACE_URL}/license?name=${encodeURIComponent(name)}&key=${encodeURIComponent(
        licenseKey || ''
      )}`
    ).then((r) => r.json());
    if (!check.valid) return res.status(403).json({ error: 'invalid license' });
  } catch (err) {
    return res.status(500).json({ error: 'license check failed' });
  }
  const list = read();
  const p = find(name, list);
  p.installs++;
  save(list);
  res.status(201).json({ ok: true });
});

app.post('/remove', (req, res) => {
  const list = read();
  const p = find(req.body.name, list);
  if (p.installs > 0) p.installs--;
  save(list);
  res.json({ ok: true });
});

app.post('/rate', (req, res) => {
  const { name, value } = req.body;
  const list = read();
  const p = find(name, list);
  p.ratings.push(Number(value));
  save(list);
  res.status(201).json({ ok: true });
});

app.get('/stats', (_req, res) => {
  res.json(read());
});

export function start(port = 3006) {
  app.listen(port, () => console.log(`plugins service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3006);
}
