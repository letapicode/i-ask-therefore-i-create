# AI-Powered UI/UX Optimization

The analytics service collects optional click and navigation events to help identify confusing areas of the portal.

## Captured Metrics
- `page` – current pathname
- `element` – CSS identifier for clicked element
- `action` – `click` or `navigate`

Events are stored in `.ui-events.json`. Suggestions are generated based on pages or elements with low engagement and available at `/analytics/uxSuggestions`.

Use `POST /analytics/uiEvent` from the frontend to record interactions.

## Opting Out
Set `NEXT_PUBLIC_DISABLE_UI_ANALYTICS=true` in the environment to disable sending UI events from the portal.

## Portal Page
The portal page `ux-optimization.tsx` lists generated suggestions and allows one-click adoption which removes the suggestion from the list.
