# Tools

Utility scripts for local development and deployment.

- `dev.sh` – start core services for testing
- `deploy.sh` – run `terraform plan` across infrastructure modules
- `bootstrap-service.sh` – create a new service folder with starter files
- `redeploy.js` – CLI to update descriptions and trigger redeployments
- `publish-mobile.js` – run Fastlane to submit iOS or Android builds
- `perf-monitor.js` – stream CloudWatch metrics to your terminal
- `offline.sh` – spin up all services locally without external dependencies
- `llm-optimization/benchmark.ts` – benchmark offline model performance
- `audit-log.js` – append audit events to a log file
- `export-data.js` – export or delete tenant data for GDPR requests
- `run-migrations.js` – apply generated SQL files to a Postgres database

- `loadtest/basic.js` – example k6 script

### Redeploy Example

```
node tools/redeploy.js --id abc123 --description "New features" --url http://localhost:3002
```

### Run Migrations

Apply pending migrations to a local Postgres database:

```
pnpm run migrate -- --connection postgres://user:pass@localhost:5432/db
```
