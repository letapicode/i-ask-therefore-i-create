# Orchestrator Service

Coordinates code generation jobs and deployments. Jobs can target different
backend languages and cloud providers.

```bash
pnpm install
node apps/orchestrator/src/index.ts
```

## Endpoints

- `POST /api/createApp` – start a new code generation job. Body:
  `{ "description": "my idea", "language": "node", "provider": "aws" }`.
  Returns a `jobId`.
- `GET /api/status/:id` – retrieve the current status of a job.
- `GET /api/apps` – list all generated apps.
- `POST /api/redeploy/:id` – submit a new description to redeploy an existing app.

Set `DEPLOY_URL`, `GCP_DEPLOY_URL` and `AZURE_DEPLOY_URL` to the deployment
webhooks for each provider. `NOTIFY_EMAIL` enables job notifications.

When `ARTIFACTS_BUCKET` is configured, generated code is uploaded to that S3 bucket after each job completes.

Set `TENANTS_TABLE` to a DynamoDB table storing `{ id, provider }` for each tenant.
Supported providers are `aws`, `azure` and `gcp`.
