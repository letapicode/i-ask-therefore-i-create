# Data Privacy and Anonymization

Exports may contain personally identifiable information (PII). Always scrub sensitive fields before sharing data outside the platform.

## CLI Usage

Use `tools/anonymize-data.ts` to sanitize JSON or CSV files:

```bash
node tools/anonymize-data.ts --input export.json --output export-anon.json
```

The script detects common PII fields such as `email` and `phone` and replaces their values with `[REDACTED]`.

## Orchestrator

The `/api/exportData` endpoint automatically anonymizes records before they are returned. You can still run the CLI on any other files you plan to distribute.
