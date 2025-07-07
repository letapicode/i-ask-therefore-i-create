import express from 'express';
import fs from 'fs';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  logAudit(`plugins ${req.method} ${req.url}`);
  next();
});

const DB = process.env.PLUGINS_DB || '.plugin-meta.json';

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

app.post('/install', (req, res) => {
  const list = read();
  const p = find(req.body.name, list);
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
