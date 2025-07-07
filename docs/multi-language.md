# Multi-Language Output

Templates can target frameworks beyond Node.js. Support includes Python FastAPI services, Go Fiber apps and React Native mobile projects. The orchestrator selects templates based on the chosen language.

## Choosing a Language

On the **New App** page in the portal, select a language from the dropdown. The options are `node`, `fastapi` and `go`. This value is sent in the `language` field to `/api/createApp` and forwarded to the code generation service. You can also call the API directly:

```bash
curl -X POST http://localhost:3002/api/createApp \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: t1' \
  -d '{"description":"todo api","language":"go"}'
```

Generated code will match the selected runtime.
