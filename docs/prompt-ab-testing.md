# Prompt A/B Testing

The prompt experiments service allows comparing multiple prompt variants and collecting success metrics.

## Usage

1. Start the service with `pnpm --filter prompt-experiments build && node services/prompt-experiments/dist/index.js`.
2. Use the orchestrator endpoints `/api/experiments` to create experiments and `/api/experiments/:id/variants` to add variants. When recording results or setting a winner via `PUT /api/experiments/:id`, provide variant and winner names that exist on the experiment; otherwise a `400` error is returned.
3. Retrieve aggregated success rates with `/api/experiments/summary`.
4. Visit `/prompt-tests` in the portal to launch tests, add variants and monitor results.
5. Download CSV results from `/api/experiments/:id/export` for further analysis.
