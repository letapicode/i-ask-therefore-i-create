# A11y Assistant Service

Consumes accessibility audit results and suggests remediation tips over time.

## Endpoints

- `POST /history` – record violations for a project
- `GET /tips` – aggregated recommendations, optional `project` query

Run with `node dist/index.js` after building.
