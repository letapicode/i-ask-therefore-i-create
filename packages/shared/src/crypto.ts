import { randomBytes, createHmac } from 'crypto';

export function generateKey(length = 32): Buffer {
  return randomBytes(length);
}

export function signMessage(key: Buffer | string, message: string): string {
  return createHmac('sha3-512', key).update(message).digest('hex');
}

export function verifyMessage(key: Buffer | string, message: string, signature: string): boolean {
  const expected = signMessage(key, message);
  return expected === signature;
}
