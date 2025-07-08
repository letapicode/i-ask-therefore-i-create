# Billing Service

Handles subscription management and invoice history using Stripe.

## Endpoints

- `GET /plans` – list available plans
- `POST /subscribe` – start a subscription
- `GET /invoices` – list invoices for the tenant
- `POST /webhook` – receive Stripe webhook events

Set `STRIPE_SECRET` for API access. Run with `node dist/index.js` after building.
