import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`billing ${req.method} ${req.url}`);
  next();
});

const STRIPE_SECRET = process.env.STRIPE_SECRET || '';
const SUBS_DB = process.env.SUBS_DB || '.subs.json';
const INV_DB = process.env.INVOICE_DB || '.invoices.json';
const EVENTS_DB = process.env.BILLING_EVENTS_DB || '.billing-events.json';

interface Subscription {
  id: string;
  email: string;
  plan: string;
  created: number;
}

interface Invoice {
  id: string;
  email: string;
  amount: number;
  created: number;
}

function read<T>(file: string): T[] {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
}

function save(file: string, data: any[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/plans', (_req, res) => {
  res.json([
    { id: 'basic', price: 0 },
    { id: 'pro', price: 1000 },
  ]);
});

app.post('/subscribe', async (req, res) => {
  const { email, plan } = req.body as { email?: string; plan?: string };
  if (!email || !plan) return res.status(400).json({ error: 'missing fields' });
  try {
    if (STRIPE_SECRET) {
      await fetch('https://api.stripe.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ 'customer[email]': email, 'items[0][price]': plan }),
      });
    }
  } catch (err) {
    console.error('stripe error', err);
  }
  const subs = read<Subscription>(SUBS_DB);
  const invoices = read<Invoice>(INV_DB);
  const sub: Subscription = { id: randomUUID(), email, plan, created: Date.now() };
  subs.push(sub);
  invoices.push({ id: randomUUID(), email, amount: 1000, created: Date.now() });
  save(SUBS_DB, subs);
  save(INV_DB, invoices);
  res.status(201).json({ id: sub.id });
});

app.get('/invoices', (_req, res) => {
  res.json(read<Invoice>(INV_DB));
});

app.post('/webhook', (req, res) => {
  const events = read<any>(EVENTS_DB);
  events.push(req.body);
  save(EVENTS_DB, events);
  res.json({ ok: true });
});

export function start(port = 3007) {
  app.listen(port, () => console.log(`billing service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3007);
}
