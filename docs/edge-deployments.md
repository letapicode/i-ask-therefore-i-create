# Edge Deployments

This guide explains how to deploy generated applications to edge networks using Cloudflare Workers or AWS Lambda@Edge.

## Setup

1. Configure the Terraform module under `infrastructure/edge` for your desired provider.
2. Set the `EDGE_DEPLOY_URL` environment variable in the orchestrator to trigger deployments.
3. Select `edge` as the provider when creating a new app:

```bash
curl -X POST http://localhost:3002/api/createApp \
  -H "x-tenant-id: demo" \
  -d '{"description":"edge demo","provider":"edge"}'
```

The orchestrator will dispatch the job and deploy the result to the configured edge platform.
