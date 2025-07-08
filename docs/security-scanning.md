# Security Scanning and SBOM Generation

Generated projects are automatically checked for vulnerable dependencies.
The `tools/security` folder contains scripts used by CI:

1. `scan.js` runs `npm audit` and queries the [OSV](https://osv.dev) API.
   Results are written to `security-report.json` and uploaded to S3 when
   `ARTIFACTS_BUCKET` is configured. The script fails if high or critical
   vulnerabilities are detected.
2. `generate-sbom.js` creates `sbom.json` listing all installed packages in
   SPDX-like format and uploads the file to the artifacts bucket if configured.

To run locally:

```bash
pnpm run security:scan
pnpm run sbom
```

If a vulnerability blocks your build, fix the dependency or override the check
by setting `ALLOW_VULNERABLE=true` when running the script.
