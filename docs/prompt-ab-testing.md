# Prompt A/B Testing

The prompt experiments service allows comparing multiple prompt variants and collecting success metrics.

## Usage

1. Start the service with `pnpm --filter prompt-experiments build && node services/prompt-experiments/dist/index.js`.
2. Use the orchestrator endpoints `/api/experiments` to create, update and retrieve experiments.
3. Visit `/prompt-tests` in the portal to launch tests and monitor results.
4. Download CSV results from `/api/experiments/:id/export` for further analysis.
