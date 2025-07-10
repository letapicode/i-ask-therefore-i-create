# Federated Training

The federated training service collects model updates from tenants and aggregates them using differential privacy.

## Opt-In
Tenants must explicitly opt in by sending `POST /optIn` to the service with their tenant ID. Only opted-in tenants are included when aggregating updates.

## Submitting Updates
Send `POST /api/modelUpdate` to the orchestrator with `{ weights: number[] }` in the body. The orchestrator forwards the request to the training service along with the tenant ID header.

## Aggregated Model
Fetching `GET /model` on the federated training service returns the latest aggregated weights with noise applied.
