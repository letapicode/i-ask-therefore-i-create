import fs from 'fs';
import { randomUUID } from 'crypto';
import { JsonRpcProvider, Wallet } from 'ethers';

export interface PurchaseRecord {
  plugin: string;
  buyer: string;
  licenseKey: string;
  tx: string;
  time: number;
}

function readLedger(file: string): PurchaseRecord[] {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

function saveLedger(file: string, data: PurchaseRecord[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function recordPurchase(
  plugin: string,
  buyer: string,
  licenseKey: string,
  ledgerFile = '.ledger.json'
): string {
  const tx = randomUUID();
  const ledger = readLedger(ledgerFile);
  ledger.push({ plugin, buyer, licenseKey, tx, time: Date.now() });
  saveLedger(ledgerFile, ledger);
  return tx;
}

export function verifyLicense(
  plugin: string,
  licenseKey: string,
  ledgerFile = '.ledger.json'
): boolean {
  const ledger = readLedger(ledgerFile);
  return ledger.some((r) => r.plugin === plugin && r.licenseKey === licenseKey);
}

export interface ChainOptions {
  rpcUrl: string;
  privateKey?: string;
}

export function createBlockchainConnector(options: ChainOptions) {
  const provider = new JsonRpcProvider(options.rpcUrl);
  const wallet = options.privateKey
    ? new Wallet(options.privateKey, provider)
    : undefined;
  return {
    async getBalance(address: string) {
      const balance = await provider.getBalance(address);
      return balance.toString();
    },
    async sendTransaction(to: string, value: bigint) {
      if (!wallet) throw new Error('missing privateKey');
      const tx = await wallet.sendTransaction({ to, value });
      await tx.wait();
      return tx.hash;
    },
  };
}

export const ethereumConnector = createBlockchainConnector;
export const polygonConnector = createBlockchainConnector;
