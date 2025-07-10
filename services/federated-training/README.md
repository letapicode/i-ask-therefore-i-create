# Federated Training Service

Collects model updates from tenants and aggregates them with differential privacy. Tenants must opt in before submitting updates.

## Endpoints

- `POST /optIn` – enable sharing for a tenant `{ tenantId }`
- `POST /update` – submit weight updates `{ tenantId, weights: number[] }`
- `GET /model` – return the aggregated model weights

Run `node dist/index.js` after building to start the service.
