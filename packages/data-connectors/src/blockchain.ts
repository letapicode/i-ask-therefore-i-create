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

function latestRecord(
  plugin: string,
  licenseKey: string,
  ledger: PurchaseRecord[],
): PurchaseRecord | undefined {
  for (let i = ledger.length - 1; i >= 0; i--) {
    const rec = ledger[i];
    if (rec.plugin === plugin && rec.licenseKey === licenseKey) return rec;
  }
  return undefined;
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

export function getLicenseOwner(
  plugin: string,
  licenseKey: string,
  ledgerFile = '.ledger.json'
): string | undefined {
  const ledger = readLedger(ledgerFile);
  const rec = latestRecord(plugin, licenseKey, ledger);
  return rec?.buyer;
}

export function transferLicense(
  plugin: string,
  licenseKey: string,
  from: string,
  to: string,
  ledgerFile = '.ledger.json'
): string {
  const ledger = readLedger(ledgerFile);
  const current = latestRecord(plugin, licenseKey, ledger);
  if (!current || current.buyer !== from) {
    throw new Error('license not owned by sender');
  }
  const tx = randomUUID();
  ledger.push({ plugin, buyer: to, licenseKey, tx, time: Date.now() });
  saveLedger(ledgerFile, ledger);
  return tx;
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
