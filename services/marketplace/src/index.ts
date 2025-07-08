import express from 'express';
import fs from 'fs';
import { logAudit } from '../../packages/shared/src/audit';
import { templates } from '../../packages/codegen-templates/src/templates';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { stripeConnector } from '../../packages/data-connectors/src';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`marketplace ${req.method} ${req.url}`);
  next();
});

const DB = process.env.PLUGIN_DB || '.plugins.json';
const STRIPE_KEY = process.env.STRIPE_KEY || '';

interface PluginEntry {
  name: string;
  description?: string;
  price: number;
  purchaseCount: number;
  [key: string]: any;
}

function read(): PluginEntry[] {
  return fs.existsSync(DB)
    ? (JSON.parse(fs.readFileSync(DB, 'utf-8')) as PluginEntry[])
    : [];
}
function save(data: PluginEntry[]) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.get('/plugins', (_req, res) => {
  res.json(read());
});

app.post('/plugins', (req, res) => {
  const { name, description = '', price = 0 } = req.body;
  if (!name) return res.status(400).json({ error: 'missing name' });
  const list = read();
  list.push({
    name,
    description,
    price: Number(price),
    purchaseCount: 0,
    time: Date.now(),
  });
  save(list);
  res.status(201).json({ ok: true });
});

app.post('/install', (req, res) => {
  logAudit(`install plugin ${req.body.name}`);
  res.json({ ok: true });
});

app.post('/purchase', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'missing name' });
  const list = read();
  const plugin = list.find((p) => p.name === name);
  if (!plugin) return res.status(404).json({ error: 'not found' });
  try {
    await stripeConnector({ apiKey: STRIPE_KEY });
    plugin.purchaseCount = (plugin.purchaseCount || 0) + 1;
    save(list);
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'payment failed' });
  }
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
