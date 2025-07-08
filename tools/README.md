# Tools

Utility scripts for local development and deployment.

- `dev.sh` – start core services for testing
- `deploy.sh` – run `terraform plan` across infrastructure modules
- `bootstrap-service.sh` – create a new service folder with starter files
- `redeploy.js` – CLI to update descriptions and trigger redeployments
- `perf-monitor.js` – stream CloudWatch metrics to your terminal
- `offline.sh` – spin up all services locally without external dependencies
- `audit-log.js` – append audit events to a log file
- `export-data.js` – export or delete tenant data for GDPR requests

- `loadtest/basic.js` – example k6 script

### Redeploy Example

```
node tools/redeploy.js --id abc123 --description "New features" --url http://localhost:3002
```

- `collab-editor.js` – live collaboration CLI for editing description files via WebSockets
- `security-scan.js` – run ESLint and npm audit to check generated projects
- `security/scan.js` – perform `npm audit` and OSV queries and write `security-report.json`
- `security/generate-sbom.js` – output `sbom.json` listing all installed packages
- `scale-advisor.js` – suggest autoscaling adjustments based on recent CloudWatch metrics
- `auto-patch.js` – update dependencies using npm-check-updates and install patches
- `smart-upgrade.js` – upgrade dependencies and revert if tests fail
- `live-assistant.js` – explain code and suggest improvements using an LLM
- `quality-dashboard.js` – run tests with coverage and print a summary
- `compliance-check.js` – scan files for disallowed patterns
- `extract-i18n.js` – gather UI strings for translation
- `llm-sandbox.js` – send custom prompts to any model endpoint
- `voice-modeler.js` – record descriptions for data models
- `sustainability-report.js` – estimate energy usage from CloudWatch metrics
- `backup.js` – copy project data into timestamped folders
- `train-from-ratings.js` – retrain the model based on collected ratings
