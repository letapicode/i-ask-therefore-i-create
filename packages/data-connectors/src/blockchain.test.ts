import fs from 'fs';
import { recordPurchase, verifyLicense } from './blockchain';

const LEDGER = '.test-ledger.json';

afterEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
});

test('records purchase and verifies license', () => {
  const tx = recordPurchase('plugin', 'buyer', 'key123', LEDGER);
  expect(tx).toBeDefined();
  const data = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  expect(data[0].plugin).toBe('plugin');
  expect(verifyLicense('plugin', 'key123', LEDGER)).toBe(true);
  expect(verifyLicense('plugin', 'bad', LEDGER)).toBe(false);
});
