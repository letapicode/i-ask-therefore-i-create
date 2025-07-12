# Edge Deployments

Generated apps can be deployed to edge networks like Cloudflare Workers or Lambda@Edge for low-latency responses.

Use the `edge` provider when creating an app:

```bash
curl -X POST http://localhost:3002/api/createApp \
  -H "x-tenant-id: TENANT" \
  -d '{"description":"hello","provider":"edge"}'
```

The infrastructure module `infrastructure/edge` provisions the required resources.
Run `terraform init && terraform fmt` inside the module before applying.
