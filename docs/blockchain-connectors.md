# Blockchain Connectors

The data connectors package provides helpers for interacting with Ethereum and Polygon networks. These wrappers use JSON-RPC via `ethers` and let generated apps query balances or send native token transactions.

## Usage

```ts
import { ethereumConnector, polygonConnector } from '@iac/data-connectors';

const eth = ethereumConnector({
  rpcUrl: 'https://mainnet.infura.io/v3/<id>',
  privateKey: process.env.PRIV_KEY,
});
const balance = await eth.getBalance('0xYourAddress');
const txHash = await eth.sendTransaction(
  '0xReceiver',
  BigInt(1_000_000_000_000_000n)
);

const poly = polygonConnector({
  rpcUrl: 'https://polygon-rpc.com',
  privateKey: process.env.PRIV_KEY,
});
await poly.sendTransaction('0xReceiver', BigInt(1_000_000_000_000_000n));
```

Set your RPC URL and private key through the portal connectors page. Only specify a private key if you need to send transactions; read-only operations just require the RPC URL.
