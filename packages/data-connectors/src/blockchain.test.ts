import fs from 'fs';
import {
  recordPurchase,
  verifyLicense,
  transferLicense,
  getLicenseOwner,
  bridgeRecord,
  syncLedgers,
} from './blockchain';

const LEDGER = '.test-ledger.json';
const LEDGER2 = '.test-ledger2.json';

afterEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
  if (fs.existsSync(LEDGER2)) fs.unlinkSync(LEDGER2);
});

test('records purchase and verifies license', () => {
  const tx = recordPurchase('plugin', 'buyer', 'key123', LEDGER);
  expect(tx).toBeDefined();
  const data = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  expect(data[0].plugin).toBe('plugin');
  expect(verifyLicense('plugin', 'key123', LEDGER)).toBe(true);
  expect(verifyLicense('plugin', 'bad', LEDGER)).toBe(false);
});

test('transfers license ownership', () => {
  recordPurchase('p', 'alice', 'k1', LEDGER);
  const tx = transferLicense('p', 'k1', 'alice', 'bob', LEDGER);
  expect(tx).toBeDefined();
  expect(getLicenseOwner('p', 'k1', LEDGER)).toBe('bob');
});

test('bridges single record', () => {
  const tx = recordPurchase('p', 'alice', 'k1', LEDGER);
  const bridged = bridgeRecord(tx, LEDGER, LEDGER2);
  expect(bridged).not.toBe(tx);
  expect(verifyLicense('p', 'k1', LEDGER2)).toBe(true);
});

test('syncs ledgers', () => {
  recordPurchase('p', 'alice', 'k1', LEDGER);
  recordPurchase('p', 'bob', 'k2', LEDGER);
  const added = syncLedgers(LEDGER, LEDGER2);
  expect(added.length).toBe(2);
  const addedAgain = syncLedgers(LEDGER, LEDGER2);
  expect(addedAgain.length).toBe(0);
});
