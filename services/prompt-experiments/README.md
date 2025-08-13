# Prompt Experiments Service

This service manages prompt A/B tests and metrics.

## Endpoints

- `GET /experiments` – list all experiments
- `GET /experiments/summary` – list summaries with success rates
- `POST /experiments` – create a new experiment
- `POST /experiments/:id/variants` – add a variant
- `PUT /experiments/:id/variants/:name` – update a variant's prompt
- `DELETE /experiments/:id/variants/:name` – remove a variant (clears winner if deleted)
- `GET /experiments/:id` – fetch a single experiment
- `GET /experiments/:id/summary` – get success rates and best variant
- `GET /experiments/:id/export` – download results as CSV
- `POST /experiments/:id/reset` – reset all variant metrics and clear winner
- `PUT /experiments/:id` – record results or set winner. Variant and winner names must match existing variants or the request will fail with HTTP 400.
- `DELETE /experiments/:id` – remove an experiment

All inputs are sanitized to prevent HTML injection.
