# Regional Data Compliance Toolkit

Retention policies can be configured per region using JSON files in `policies/`. The orchestrator can apply these settings when exporting or deleting user data.
Visit `/policies` in the portal to view the current policy loaded from the server.

## Exporting Data By Region

Use the `export-region.js` CLI to download all job records for a specific region:

```bash
node tools/export-region.js --region eu --out eu-data.json
```

## Onboarding a New Region

1. Create a new JSON policy under `policies/<code>.json` with `region` and `retentionDays`.
2. Restart services so `policyMiddleware` can load the file.
3. Run `node tools/compliance-report.js` to verify all services enforce the policy.
4. Deploy using `tools/deploy.sh` which checks compliance before running Terraform.
