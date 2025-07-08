# Analytics Service

Simple Express server to record usage events and provide basic metrics.

## Endpoints

- `POST /events` – record an event payload
- `POST /click` – record a UI click path
- `POST /session/start` – begin tracking a session
- `POST /session/end` – end a session and store its duration
- `GET /metrics` – return number of recorded events
- `GET /summary` – counts by event type
- `GET /performance` – recent performance metrics with optional `app` and `range` query params
- `GET /alerts` – events exceeding the alert threshold

Set `ALERT_THRESHOLD` to trigger alerts when a metric value exceeds the given number.

Run with `node dist/index.js` after building.
