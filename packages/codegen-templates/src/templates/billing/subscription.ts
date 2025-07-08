import Stripe from 'stripe';
import express from 'express';

export function createBillingRouter() {
  const router = express.Router();
  const stripe = new Stripe('sk-test', { apiVersion: '2020-08-27' });

  router.post('/subscribe', async (req, res) => {
    const { customer, price } = req.body;
    await stripe.subscriptions.create({ customer, items: [{ price }] });
    res.json({ ok: true });
  });

  router.post('/webhook', (req, res) => {
    // handle webhook events
    res.json({ received: true });
  });

  return router;
}
