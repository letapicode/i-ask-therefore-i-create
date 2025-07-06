# Code Generation Service

Runs code generation tasks based on templates.

Start the service with:

```bash
pnpm install
node apps/codegen/src/index.ts
```

Set `OPENAI_API_KEY` to enable code generation via the OpenAI API. Generated templates are cached in memory so repeated descriptions return instantly.

## Endpoint

- `POST /generate` – invoked by the orchestrator to generate code. Retries are handled using the `retry` helper.

## Isolated Execution

Run the service in a container using the helper script:

```bash
./tools/run_codegen_container.sh
```

This builds the image defined in `apps/codegen/Dockerfile` and exposes port `3003`.
