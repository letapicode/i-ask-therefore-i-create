# Tools

Utility scripts for local development and deployment.

- `dev.sh` – start core services for testing
- `deploy.sh` – run `terraform plan` across infrastructure modules
- `bootstrap-service.sh` – create a new service folder with starter files
- `redeploy.js` – CLI to update descriptions and trigger redeployments

- `loadtest/basic.js` – example k6 script

### Redeploy Example

```
node tools/redeploy.js --id abc123 --description "New features" --url http://localhost:3002
```
