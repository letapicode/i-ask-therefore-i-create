import express from 'express';
import fs from 'fs';
import Stripe from 'stripe';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`billing ${req.method} ${req.url}`);
  next();
});

const DB = process.env.BILLING_DB || '.billing.json';
const stripe = new Stripe('sk-test', { apiVersion: '2020-08-27' });

interface Plan {
  id: string;
  price: number;
}

interface Subscription {
  user: string;
  plan: string;
}

function read(): { plans: Plan[]; subs: Subscription[] } {
  if (!fs.existsSync(DB)) return { plans: [], subs: [] };
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function save(data: { plans: Plan[]; subs: Subscription[] }) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.get('/plans', (_req, res) => {
  const data = read();
  res.json(data.plans);
});

app.post('/plans', (req, res) => {
  const data = read();
  const idx = data.plans.findIndex((p) => p.id === req.body.id);
  if (idx >= 0) data.plans[idx] = req.body;
  else data.plans.push(req.body);
  save(data);
  res.status(201).json({ ok: true });
});

app.post('/subscribe', (req, res) => {
  const data = read();
  data.subs.push({ user: req.body.user, plan: req.body.plan });
  save(data);
  res.status(201).json({ ok: true });
});

app.get('/metrics', (_req, res) => {
  const data = read();
  const counts: Record<string, number> = {};
  for (const s of data.subs) {
    counts[s.plan] = (counts[s.plan] || 0) + 1;
  }
  res.json(counts);
});

app.post('/webhook', (req, res) => {
  const event = req.body;
  logAudit(`stripe event ${event.type}`);
  res.json({ received: true });
});

export function start(port = 3007) {
  app.listen(port, () => console.log(`billing listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3007);
}
