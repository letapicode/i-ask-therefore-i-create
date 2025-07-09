# Analytics Service

Simple Express server to record usage events and provide basic metrics.

## Endpoints

- `POST /events` – record an event payload
- `GET /metrics` – return number of recorded events
- `GET /summary` – counts by event type
- `GET /performance` – recent performance metrics with optional `app` and `range` query params
- `GET /alerts` – events exceeding the alert threshold
- `POST /chat` – store a chat message
- `GET /chat` – list recent chat history
- `GET /businessTips` – return monetization recommendations and marketing copy

Set `ALERT_THRESHOLD` to trigger alerts when a metric value exceeds the given number.
Set `ENABLE_BUSINESS_TIPS=true` to enable the `/businessTips` endpoint. Events with types `purchase`, `trialStart` and `conversion` will be analyzed.

Run with `node dist/index.js` after building.
