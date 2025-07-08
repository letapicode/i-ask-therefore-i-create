# Billing Service

Handles subscription plans and Stripe webhooks.

## Endpoints

- `GET /plans` – list available plans
- `POST /plans` – create or update a subscription plan
- `POST /subscribe` – subscribe a user to a plan
- `GET /metrics` – current subscriber counts
- `POST /webhook` – receive events from Stripe

Run with `node dist/index.js` after building.
