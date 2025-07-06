# Orchestrator Service

Coordinates code generation jobs and deployments.

```bash
pnpm install
node apps/orchestrator/src/index.ts
```

## Endpoints

- `POST /api/createApp` – start a new code generation job. Body: `{ "description": "my idea" }`. Returns a `jobId`.
- `GET /api/status/:id` – retrieve the current status of a job.
- `GET /api/apps` – list all generated apps.
- `POST /api/redeploy/:id` – submit a new description to redeploy an existing app.

Set `DEPLOY_URL` to the deployment webhook and `NOTIFY_EMAIL` to receive job
notifications.

When `ARTIFACTS_BUCKET` is configured, generated code is uploaded to that S3 bucket after each job completes.
