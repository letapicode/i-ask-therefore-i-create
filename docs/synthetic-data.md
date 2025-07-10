# Synthetic Data Generation

Use the CLI to create anonymized records:

```bash
pnpm exec ts-node tools/synthetic-data.ts user -c 5 > users.json
```

The `/api/syntheticData` orchestrator endpoint proxies to the service for remote dataset creation.

Ensure templates are stored under `packages/codegen-templates/data-templates` and avoid sensitive information when sharing generated data.
