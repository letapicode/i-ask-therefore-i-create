# Security Scanning

Generated artifacts are checked for known vulnerabilities before deployment.

1. `tools/security-scan.js` runs OWASP dependency checks and license audits on the build directory.
2. The orchestrator invokes this script for each job during the `dispatchJob` workflow.
3. Deployment is skipped if any scan step fails.

Run manually with:

```bash
node tools/security-scan.js --dir ./path/to/artifact
```
