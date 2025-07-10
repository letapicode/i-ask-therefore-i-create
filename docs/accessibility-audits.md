# Accessibility Audits

Run `pnpm exec ts-node tools/a11y-scan.ts <file>` to scan an HTML file using axe-core.
The script writes `a11y-report.json` with a list of violations.

The portal page `/a11y` allows uploading a file path and marking issues as fixed.

