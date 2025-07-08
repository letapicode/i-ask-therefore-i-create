# Plugin Marketplace Service

Simple service providing a minimal plugin catalog.

## Endpoints

- `GET /plugins` – list available plugins
- `POST /plugins` – publish a new plugin
- `POST /install` – record an installation event
- `POST /purchase` – process a payment and record the purchase
- `GET /templates` – list code generation templates

Run with `node dist/index.js` after building.

## Plugin Schema

Plugins stored by this service include pricing information and a running
`purchaseCount` for analytics:

```json
{
  "name": "example-plugin",
  "description": "Adds auth",
  "price": 5,
  "purchaseCount": 0,
  "time": 1690000000000
}
```
