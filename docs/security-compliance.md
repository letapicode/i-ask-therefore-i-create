# Security and Compliance Workflow

Dependency audits run daily through the `Security Audit` workflow in
`ci/security-audit.yml`. The job executes `tools/security-audit.js`, which scans
projects under `apps/` and generates SBOM files.
Results are written to `services/analytics/security` and exposed via the
`/analytics/securityReports` API. The existing `/analytics/complianceReport`
endpoint returns retention details from the loaded policy files.

The portal page `security.tsx` visualizes vulnerability counts and policy
settings so you can quickly identify issues across projects.
