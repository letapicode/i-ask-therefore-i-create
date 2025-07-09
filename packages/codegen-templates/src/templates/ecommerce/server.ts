import express from 'express';
import { stripeConnector } from '@iac/data-connectors';
import fetch from 'node-fetch';

const PRODUCTS = [
  { id: 1, name: 'Sample Product', price: 20 },
];
const SHIPPING_RATE = Number(process.env.SHIPPING_RATE || '5');
const TAX_RATE = Number(process.env.TAX_RATE || '0.07');
const STRIPE_KEY = process.env.STRIPE_KEY || 'sk_test_key';
const ANALYTICS_URL = process.env.ANALYTICS_URL || '';

export const app = express();
app.use(express.json());

app.get('/products', (_req, res) => {
  res.json(PRODUCTS);
});

app.post('/checkout', async (req, res) => {
  const items = req.body.items || [];
  await stripeConnector({ apiKey: STRIPE_KEY });
  const total = items.reduce((sum: number, i: any) => sum + i.price, 0);
  const price = total + SHIPPING_RATE + total * TAX_RATE;
  if (ANALYTICS_URL) {
    await fetch(`${ANALYTICS_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'purchase', value: price }),
    });
  }
  res.json({ ok: true, charged: price });
});

const port = Number(process.env.PORT || '4000');
app.listen(port, () => console.log(`ecommerce api listening on ${port}`));
