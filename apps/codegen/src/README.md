# Code Generation Service

Runs code generation tasks based on templates.

Start the service with:
```bash
pnpm install
node apps/codegen/src/index.ts
```

Set `OPENAI_API_KEY` to enable code generation via the OpenAI API.

## Endpoint

- `POST /generate` – invoked by the orchestrator to generate code. Retries are handled using the `retry` helper.
