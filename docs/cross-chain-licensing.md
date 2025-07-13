# Cross-Chain Plugin Licensing

This feature mirrors plugin license records across Ethereum and Polygon so users can prove ownership on either chain.

## Configuration

1. Set `CROSS_CHAIN_QUEUE` to a writable file used for pending sync jobs.
2. Set `BLOCKCHAIN_LEDGER` to the primary ledger file (e.g. `ethereum-ledger.json`).
3. Run `tools/resync-licenses.ts` periodically to bridge transactions to the secondary ledger.

## Resync Script

```
node tools/resync-licenses.ts --source ethereum-ledger.json --target polygon-ledger.json --queue .cross-chain-queue.json
```

The script processes queued jobs and copies missing purchase records. Failed jobs remain in the queue for later retry.
