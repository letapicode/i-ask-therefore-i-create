import express from 'express';
import fs from 'fs';

export const app = express();
app.use(express.json());

const UPDATES_FILE = process.env.UPDATES_FILE || '.updates.json';
const MODEL_FILE = process.env.MODEL_FILE || '.model.json';
const OPT_IN_FILE = process.env.OPT_IN_FILE || '.optin.json';
const NOISE = Number(process.env.DP_NOISE || '0.01');

function readJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as T)
    : fallback;
}

function writeJson(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function gaussian(std = 1) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

app.post('/optIn', (req, res) => {
  const { tenantId } = req.body;
  if (!tenantId) return res.status(400).json({ error: 'missing tenantId' });
  const list = readJson<string[]>(OPT_IN_FILE, []);
  if (!list.includes(tenantId)) {
    list.push(tenantId);
    writeJson(OPT_IN_FILE, list);
  }
  res.status(201).json({ ok: true });
});

app.post('/update', (req, res) => {
  const { tenantId, weights } = req.body as {
    tenantId?: string;
    weights?: number[];
  };
  if (!tenantId || !Array.isArray(weights))
    return res.status(400).json({ error: 'invalid payload' });
  const opts = readJson<string[]>(OPT_IN_FILE, []);
  if (!opts.includes(tenantId))
    return res.status(403).json({ error: 'not opted in' });
  const list = readJson<any[]>(UPDATES_FILE, []);
  list.push({ tenantId, weights });
  writeJson(UPDATES_FILE, list);
  res.status(201).json({ ok: true });
});

app.get('/model', (_req, res) => {
  const opts = readJson<string[]>(OPT_IN_FILE, []);
  const updates = readJson<any[]>(UPDATES_FILE, []);
  const filtered = updates.filter((u) => opts.includes(u.tenantId));
  if (!filtered.length) return res.json([]);
  const len = filtered[0].weights.length;
  const agg = new Array(len).fill(0);
  for (const u of filtered) {
    for (let i = 0; i < len; i++) agg[i] += u.weights[i];
  }
  for (let i = 0; i < len; i++) {
    agg[i] = agg[i] / filtered.length + gaussian(NOISE);
  }
  writeJson(MODEL_FILE, agg);
  res.json(agg);
});

export function start(port = 3010) {
  app.listen(port, () => console.log(`federated training on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3010);
}
