# Query Optimizer Service

Records query execution statistics and suggests optimizations.

## Endpoints

- `POST /stats` – record a query duration `{ appId, query, duration }`
- `GET /recommendations` – list optimization suggestions (filter with `appId`)
- `POST /recommendations/:id/apply` – mark a recommendation as applied

Run with `node dist/index.js` after building.
