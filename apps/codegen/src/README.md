# Code Generation Service

Runs code generation tasks based on templates.

Start the service with:
```bash
pnpm install
node apps/codegen/src/index.ts
```

## Endpoint

- `POST /generate` – invoked by the orchestrator to generate code. Retries are handled using the `retry` helper.
