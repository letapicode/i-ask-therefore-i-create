# Real-Time Dashboard Monitoring

The portal dashboard now displays charts for analytics data using Chart.js and highlights alerts when metrics exceed configured thresholds.

## Configuration

- `EVENT_DB` – path to the JSON file storing events.
- `EXPERIMENT_DB` – path to experiment data.
- `ALERT_THRESHOLD` – numeric value that triggers an alert when a performance metric surpasses it.

Use query parameters `app` and `range` (hours) with `/analytics/performance` and `/analytics/alerts` to filter data for a specific app and time window.
