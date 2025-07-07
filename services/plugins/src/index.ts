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

let plugins: PluginMeta[] = [];

function load() {
  if (fs.existsSync(DB)) {
    plugins = JSON.parse(fs.readFileSync(DB, 'utf-8')) as PluginMeta[];
  }
}

function persist() {
  fs.writeFile(DB, JSON.stringify(plugins, null, 2), () => {
    /* ignore errors */
  });
}

function find(name: string) {
  let p = plugins.find((pl) => pl.name === name);
  if (!p) {
    p = { name, installs: 0, ratings: [] };
    plugins.push(p);
  }
  return p;
}

load();

app.post('/install', (req, res) => {
  const p = find(req.body.name);
  p.installs++;
  persist();
  res.status(201).json({ ok: true });
});

app.post('/remove', (req, res) => {
  const p = find(req.body.name);
  if (p.installs > 0) p.installs--;
  persist();
  res.json({ ok: true });
});

app.post('/rate', (req, res) => {
  const { name, value } = req.body;
  const p = find(name);
  p.ratings.push(Number(value));
  persist();
  res.status(201).json({ ok: true });
});

app.get('/stats', (_req, res) => {
  res.json(plugins);
});

export function start(port = 3006) {
  app.listen(port, () => console.log(`plugins service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3006);
}
