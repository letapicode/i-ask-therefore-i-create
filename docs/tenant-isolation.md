# Tenant Isolation

This design describes how the platform keeps data for each tenant separate.

## Acceptance Criteria

- Every request to backend services must include the `x-tenant-id` header.
- Job records in the `jobs` table store this tenant identifier.
- API responses only return jobs belonging to the requesting tenant.

## Usage Example

```bash
curl -H "x-tenant-id: my-user" -X POST \
  -d '{"description":"test"}' http://localhost:3002/api/createApp
```

The `/api/status/:id` and `/api/apps` endpoints require the same header.
