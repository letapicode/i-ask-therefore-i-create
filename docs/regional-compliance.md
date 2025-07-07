# Regional Data Compliance Toolkit

Retention policies can be configured per region using JSON files in `policies/`. The orchestrator can apply these settings when exporting or deleting user data.
Visit `/policies` in the portal to view the current policy loaded from the server.

## Adding a new region

1. Create a JSON file under `policies/` named after the region code. Example:

```json
{
  "region": "apac",
  "retentionDays": 60
}
```

2. Restart the services so the middleware can load the new policy.

## Exporting or deleting data

The orchestrator exposes two endpoints that honor the loaded policy:

- `GET /api/exportData` – returns tenant records newer than the retention period.
- `DELETE /api/exportData` – removes those records from storage.

Include the tenant id header (`x-tenant-id`) and optional `x-region` header when calling these endpoints.
