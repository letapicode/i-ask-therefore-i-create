# Billing Toolkit

The billing service exposes simple endpoints for managing subscription plans and subscribers.

## Endpoints

- `GET /billing/plans` – list configured plans
- `POST /billing/plans` – create or update a plan
- `POST /billing/subscribe` – subscribe a user to a plan
- `GET /billing/metrics` – subscriber counts per plan
- `POST /billing/webhook` – Stripe webhook receiver

Use these endpoints from your generated apps to enable paid tiers. When running locally, the service stores data in `.billing.json`.
