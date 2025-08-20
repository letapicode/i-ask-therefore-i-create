import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';
import { sanitize } from '../../packages/shared/src/sanitize';

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

interface VariantSummary {
  prompt: string;
  success: number;
  total: number;
  rate: number;
}

interface ExperimentSummary {
  id: string;
  name: string;
  winner?: string;
  variants: Record<string, VariantSummary>;
  best?: string;
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

function summarize(exp: Experiment): ExperimentSummary {
  const summaries: Record<string, VariantSummary> = {};
  let best = exp.winner;
  let bestRate = -1;
  for (const [name, v] of Object.entries(exp.variants)) {
    const rate = v.total === 0 ? 0 : v.success / v.total;
    summaries[name] = { ...v, rate };
    if (rate > bestRate) {
      bestRate = rate;
      best = name;
    }
  }
  return {
    id: exp.id,
    name: exp.name,
    winner: exp.winner,
    variants: summaries,
    best,
  };
}

function exportCsv(exp: Experiment): string {
  const header = 'variant,prompt,success,total,rate';
  const rows = Object.entries(exp.variants).map(([name, v]) => {
    const prompt = `"${v.prompt.replace(/"/g, '""')}"`;
    const rate = v.total === 0 ? 0 : v.success / v.total;
    return `${name},${prompt},${v.success},${v.total},${rate}`;
  });
  return [header, ...rows].join('\n');
}

app.get('/experiments', (_req, res) => {
  res.json(read());
});

app.get('/experiments/summary', (_req, res) => {
  const list = read().map(summarize);
  res.json(list);
});

app.post('/experiments', (req, res) => {
  const { name, variants } = req.body as {
    name?: string;
    variants?: Record<string, { prompt: string }>;
  };
  if (!name || !variants)
    return res.status(400).json({ error: 'missing fields' });
  const list = read();
  const record: Experiment = {
    id: randomUUID(),
    name: sanitize(name),
    variants: Object.fromEntries(
      Object.entries(variants).map(([k, v]) => [
        k,
        { prompt: sanitize(v.prompt), success: 0, total: 0 },
      ])
    ),
    created: Date.now(),
  };
  list.push(record);
  save(list);
  res.status(201).json(record);
});

app.post('/experiments/:id/variants', (req, res) => {
  const { name, prompt } = req.body as {
    name?: string;
    prompt?: string;
  };
  if (!name || !prompt)
    return res.status(400).json({ error: 'missing fields' });

  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const cleanName = sanitize(name);
  if (exp.variants[cleanName])
    return res.status(400).json({ error: 'variant exists' });

  exp.variants[cleanName] = {
    prompt: sanitize(prompt),
    success: 0,
    total: 0,
  };
  save(list);
  res.status(201).json(exp.variants[cleanName]);
});

app.put('/experiments/:id/variants/:name', (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt) return res.status(400).json({ error: 'missing fields' });

  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const variantName = sanitize(req.params.name);
  const variant = exp.variants[variantName];
  if (!variant) return res.status(404).json({ error: 'variant not found' });

  variant.prompt = sanitize(prompt);
  save(list);
  res.json(variant);
});

app.put('/experiments/:id/variants/:name/name', (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name) return res.status(400).json({ error: 'missing fields' });

  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const oldName = sanitize(req.params.name);
  const variant = exp.variants[oldName];
  if (!variant) return res.status(404).json({ error: 'variant not found' });

  const newName = sanitize(name);
  if (exp.variants[newName])
    return res.status(400).json({ error: 'variant exists' });

  exp.variants[newName] = variant;
  delete exp.variants[oldName];
  if (exp.winner === oldName) exp.winner = newName;

  save(list);
  res.json(exp.variants[newName]);
});

app.post('/experiments/:id/variants/:name/reset', (req, res) => {
  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const variantName = sanitize(req.params.name);
  const variant = exp.variants[variantName];
  if (!variant) return res.status(404).json({ error: 'variant not found' });

  variant.success = 0;
  variant.total = 0;
  if (exp.winner === variantName) delete exp.winner;

  save(list);
  res.json(variant);
});

app.delete('/experiments/:id/variants/:name', (req, res) => {
  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const variantName = sanitize(req.params.name);
  if (!exp.variants[variantName])
    return res.status(404).json({ error: 'variant not found' });

  delete exp.variants[variantName];
  if (exp.winner === variantName) delete exp.winner;
  save(list);
  res.json({ ok: true });
});

app.get('/experiments/:id', (req, res) => {
  const exp = find(req.params.id, read());
  if (!exp) return res.status(404).json({ error: 'not found' });
  res.json(exp);
});

app.get('/experiments/:id/summary', (req, res) => {
  const exp = find(req.params.id, read());
  if (!exp) return res.status(404).json({ error: 'not found' });
  res.json(summarize(exp));
});

app.get('/experiments/:id/export', (req, res) => {
  const exp = find(req.params.id, read());
  if (!exp) return res.status(404).json({ error: 'not found' });
  const csv = exportCsv(exp);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${exp.id}.csv"`);
  res.send(csv);
});

app.post('/experiments/:id/clone', (req, res) => {
  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  const clone: Experiment = {
    id: randomUUID(),
    name: sanitize(`${exp.name} copy`),
    variants: Object.fromEntries(
      Object.entries(exp.variants).map(([name, v]) => [
        name,
        { prompt: v.prompt, success: 0, total: 0 },
      ])
    ),
    created: Date.now(),
  };
  list.push(clone);
  save(list);
  res.status(201).json(clone);
});

app.post('/experiments/:id/reset', (req, res) => {
  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  for (const variant of Object.values(exp.variants)) {
    variant.success = 0;
    variant.total = 0;
  }
  delete exp.winner;

  save(list);
  res.json(exp);
});

app.put('/experiments/:id/name', (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name) return res.status(400).json({ error: 'missing fields' });

  const list = read();
  const exp = find(req.params.id, list);
  if (!exp) return res.status(404).json({ error: 'not found' });

  exp.name = sanitize(name);
  save(list);
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
    const cleanWinner = sanitize(winner);
    if (!exp.variants[cleanWinner]) {
      return res.status(400).json({ error: 'winner not found' });
    }
    exp.winner = cleanWinner;
  }

  if (variant) {
    const cleanVariant = sanitize(variant);
    const v = exp.variants[cleanVariant];
    if (!v) {
      return res.status(400).json({ error: 'variant not found' });
    }
    v.total += 1;
    if (success) v.success += 1;
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
  app.listen(port, () =>
    console.log(`prompt-experiments listening on ${port}`)
  );
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3016);
}
