import { generateKey, signMessage, verifyMessage } from './crypto';

test('sign and verify', () => {
  const key = generateKey();
  const msg = 'hello';
  const sig = signMessage(key, msg);
  expect(verifyMessage(key, msg, sig)).toBe(true);
});
