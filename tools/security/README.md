# Security Tools

This folder contains helper scripts used to scan generated projects and produce
Software Bill of Materials files.

- `scan.js` – runs `npm audit` and OSV queries, producing `security-report.json`.
  Fails with a non-zero exit code if high or critical issues are found. When
  `ARTIFACTS_BUCKET` is configured, the report is uploaded to S3.
- `generate-sbom.js` – writes `sbom.json` containing a list of all installed
  packages. The file is also uploaded to S3 when `ARTIFACTS_BUCKET` is set.

Run these tools manually or from CI workflows to verify dependencies and keep a
record of the packages included in each build.
