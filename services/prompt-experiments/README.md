# Prompt Experiments Service

This service manages prompt A/B tests and metrics.

## Endpoints

- `GET /experiments` – list all experiments
- `POST /experiments` – create or update an experiment
- `GET /experiments/:id` – fetch a single experiment
- `GET /experiments/:id/summary` – get success rates and best variant
- `PUT /experiments/:id` – update metrics or winner
- `DELETE /experiments/:id` – remove an experiment

All inputs are sanitized to prevent HTML injection.
