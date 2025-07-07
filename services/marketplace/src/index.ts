import express from 'express';
import fs from 'fs';
import { logAudit } from '../../packages/shared/src/audit';
import { templates } from '../../packages/codegen-templates/src/templates';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`marketplace ${req.method} ${req.url}`);
  next();
});

const DB = process.env.PLUGIN_DB || '.plugins.json';

function read(): any[] {
  return fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, 'utf-8')) : [];
}
function save(data: any[]) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.get('/plugins', (_req, res) => {
  res.json(read());
});

app.post('/plugins', (req, res) => {
  const list = read();
  list.push({ ...req.body, time: Date.now() });
  save(list);
  res.status(201).json({ ok: true });
});

app.post('/install', (req, res) => {
  logAudit(`install plugin ${req.body.name}`);
  res.json({ ok: true });
});

app.get('/templates', (_req, res) => {
  res.json(templates);
});

export function start(port = 3005) {
  app.listen(port, () => console.log(`marketplace listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3005);
}
