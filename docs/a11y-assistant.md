# AI-Based Accessibility Assistant

This service analyzes accessibility audit results and provides recommendations to fix common issues.

## Usage

1. Run the service:

```bash
pnpm --filter @iac/a11y-assistant build && node services/a11y-assistant/dist/index.js
```

2. Record audit results:

```bash
curl -X POST http://localhost:3012/history \
  -H 'Content-Type: application/json' \
  -d '{"project":"demo","violations":[{"id":"color-contrast","help":"Improve contrast"}]}'
```

3. Fetch tips:

```bash
curl http://localhost:3012/tips?project=demo
```

The portal editor fetches `/api/a11yTips` which proxies to this service.
