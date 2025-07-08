# Multi-Cloud Deployment

The platform can deploy generated applications to AWS, GCP or Azure. Each provider has a Terraform module under `infrastructure/`.

## Selecting a Provider

When creating a new app via the portal or `/api/createApp`, include the `cloudProvider` field. The orchestrator dispatches the job to the corresponding deployment webhook.

Example request:

```bash
curl -X POST http://localhost:3002/api/createApp \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: t1' \
  -d '{"description":"todo api","language":"node","cloudProvider":"gcp"}'
```

## Terraform Modules

- `infrastructure/aws` – deploy using AWS resources
- `infrastructure/gcp` – deploy using Google Cloud resources
- `infrastructure/azure` – deploy using Azure resources

Initialize the chosen module and apply it with Terraform to provision the stack.
