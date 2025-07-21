import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`prompt-experiments ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.EXPERIMENT_DB || '.prompt-experiments.json';

interface Experiment {
  id: string;
  name: string;
  variants: Record<string, { prompt: string; success: number; total: number }>;
  winner?: string;
  created: number;
}

function read(): Experiment[] {
  return fs.existsSync(DB_FILE)
    ? (JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Experiment[])
    : [];
}

function save(data: Experiment[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function find(id: string, list: Experiment[]) {
  return list.find((e) => e.id === id);
}

app.get('/experiments', (_req, res) => {
  res.json(read());
});

app.post('/experiments', (req, res) => {
  const { name, variants } = req.body as {
    name?: string;
    variants?: Record<string, { prompt: string }>;
  };
  if (!name || !variants) return res.status(400).json({ error: 'missing fields' });
  const list = read();
  const record: Experiment = {
    id: randomUUID(),
    name,
    variants: Object.fromEntries(
      Object.entries(variants).map(([k, v]) => [k, { prompt: v.prompt, success: 0, total: 0 }])
    ),
    created: Date.now(),
  };
  list.push(record);
  save(list);
  res.status(201).json(record);
});

app.get('/experiments/:id', (req, res) => {
  const exp = find(req.params.id, read());
  if (!exp) return res.status(404).json({ error: 'not found' });
  res.json(exp);
});

app.put('/experiments/:id', (req, res) => {
  const { variant, success, winner } = req.body as {
    variant?: string;
    success?: boolean;
    winner?: string;
  };
  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });
  if (winner) {
    exp.winner = winner;
  }
  if (variant && exp.variants[variant]) {
    exp.variants[variant].total += 1;
    if (success) exp.variants[variant].success += 1;
  }
  save(list);
  res.json(exp);
});

app.delete('/experiments/:id', (req, res) => {
  const list = read();
  const idx = list.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  list.splice(idx, 1);
  save(list);
  res.json({ ok: true });
});

export function start(port = 3016) {
  app.listen(port, () => console.log(`prompt-experiments listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3016);
}
