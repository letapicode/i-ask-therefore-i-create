# i-ask-therefore-i-create
Describe your idea. We generate the code, deploy it, and scale it—automatically.

This repository uses a monorepo structure as outlined in `implementation_plan.md`.

## Services

- **api-auth** – authentication endpoints
- **codegen** – code generation worker
- **orchestrator** – coordinates builds and deployments
- **portal** – user interface
- **services/email** – SES email wrapper
- **services/analytics** – collect usage metrics

## Getting Started

Install dependencies and start individual services:

```bash
pnpm install
node apps/api-auth/src/index.ts &
node services/analytics/src/index.ts &
```

Infrastructure modules live under `infrastructure/`. Initialize them with `terraform init`.

Local services can also be started via `docker-compose up`.
