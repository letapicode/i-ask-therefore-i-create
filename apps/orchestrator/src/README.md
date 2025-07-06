# Orchestrator Service

Coordinates code generation jobs and deployments.

```bash
pnpm install
node apps/orchestrator/src/index.ts
```

## Endpoints

- `POST /api/createApp` – start a new code generation job. Body: `{ "description": "my idea" }`. Returns a `jobId`.
- `GET /api/status/:id` – retrieve the current status of a job.
