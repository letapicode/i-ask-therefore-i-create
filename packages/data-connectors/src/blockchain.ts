import fs from 'fs';
import { randomUUID } from 'crypto';

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
