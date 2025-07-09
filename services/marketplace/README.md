# Plugin Marketplace Service

Simple service providing a minimal plugin catalog.

## Endpoints

- `GET /plugins` – list available plugins
- `POST /plugins` – publish a new plugin
- `POST /install` – record an installation event
- `POST /purchase` – process a payment and record the purchase
- `GET /license` – verify a license key
- `GET /templates` – list code generation templates

Run with `node dist/index.js` after building.

## Plugin Schema

Plugins stored by this service include pricing and issued licenses:

```json
{
  "name": "example-plugin",
  "description": "Adds auth",
  "price": 5,
  "purchaseCount": 1,
  "licenses": ["abcdef-123"],
  "time": 1690000000000
}
```
