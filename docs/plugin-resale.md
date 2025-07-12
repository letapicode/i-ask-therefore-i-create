# Plugin Resale Workflow

Plugin owners can resell or subscribe their licenses through the marketplace.
Listings are created via `POST /plugins/listings` with the plugin name,
`licenseKey`, seller address and optional price. Buyers purchase by calling
`POST /plugins/purchase-listing` which transfers ownership on-chain.

1. Generate a license normally using `/marketplace/purchase`.
2. List the license for sale:

```bash
curl -X POST http://localhost:3006/listings \
  -H 'Content-Type: application/json' \
  -d '{"plugin":"auth","licenseKey":"<key>","seller":"0xabc","price":5}'
```

3. Another user buys the license:

```bash
curl -X POST http://localhost:3006/purchase-listing \
  -H 'Content-Type: application/json' \
  -d '{"plugin":"auth","licenseKey":"<key>","buyer":"0xdef"}'
```

Ownership is updated in `.ledger.json` or on the configured blockchain.
See `infrastructure/blockchain` for the sample contract used in production.
