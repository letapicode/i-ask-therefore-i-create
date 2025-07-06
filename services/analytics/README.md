# Analytics Service

Simple Express server to record usage events and provide basic metrics.

## Endpoints

- `POST /events` – record an event payload
- `GET /metrics` – return number of recorded events
- `GET /summary` – counts by event type

Run with `node dist/index.js` after building.
