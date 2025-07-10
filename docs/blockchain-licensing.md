# Blockchain Licensing

Plugin purchases are recorded on-chain to prove ownership. The service uses a simple ledger file during development but can connect to Ethereum or Polygon in production.

1. Generate a wallet and fund it on your preferred network.
2. Set `BLOCKCHAIN_LEDGER` to the desired ledger path or mount a blockchain provider URL in production.
3. Purchases are created via `POST /purchase` with the plugin name and buyer address.
4. Installations must include the returned `licenseKey`, which is verified against the ledger.

Store private keys securely and never commit them to version control.
