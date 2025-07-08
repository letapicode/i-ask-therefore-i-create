# Billing Service

This microservice handles subscriptions and invoices using Stripe.

## Configuration

Set the following environment variables:

- `STRIPE_SECRET` – Stripe API secret key
- `SUBS_DB` – path to JSON file storing subscriptions (default `.subs.json`)
- `INVOICE_DB` – path to JSON file storing invoices (default `.invoices.json`)
- `BILLING_EVENTS_DB` – path for captured webhook events

Run `pnpm --filter billing-service build` then `node dist/index.js`.

For local testing, use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3007/webhook
```
