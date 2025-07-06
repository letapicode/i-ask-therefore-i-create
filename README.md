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
Use `./tools/offline.sh` to run the entire pipeline without external services.

### Nx Cloud Caching

Set `NX_CLOUD_ACCESS_TOKEN` in your environment to enable remote caching with Nx Cloud. The
`turbo.json` configuration is already prepared to push and pull cache entries.

## Tools

`tools/perf-monitor.js` streams CloudWatch metrics for any Lambda function:

```bash
node tools/perf-monitor.js -f my-function
```

## Linting and Formatting

Run `pnpm lint` to execute ESLint and `pnpm format` to run Prettier across the repo.

### Sentry

If `SENTRY_DSN` is set in your environment the services will forward errors to
Sentry using the helper in `packages/shared`.
