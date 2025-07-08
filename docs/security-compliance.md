# Security and Compliance Workflow

Dependency audits run daily through the `Security Audit` workflow in
`ci/security-audit.yml`. The job executes `tools/security-audit.js`, which
scans each project under `apps/` using `npm audit` and generates an SBOM
via `cyclonedx-bom`. Results are written under
`services/analytics/security` and logged with `logAudit` for traceability.

The analytics service exposes `/securityReports` and `/complianceReport`
endpoints. The portal page `security.tsx` displays vulnerability counts
from the reports alongside policy information loaded from `policies/`.
This provides a quick view of outstanding issues and retention settings
per region.
