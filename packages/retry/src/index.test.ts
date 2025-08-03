import { retry } from './index';

test('retries until success', async () => {
  let count = 0;
  const result = await retry(async () => {
    count++;
    if (count < 2) throw new Error('fail');
    return 'ok';
  });
  expect(result).toBe('ok');
  expect(count).toBe(2);
});

test('applies exponential backoff', async () => {
  const delays: number[] = [];
  const original = setTimeout;
  // Capture requested delays while executing callbacks immediately
  global.setTimeout = ((fn: (...args: any[]) => void, ms?: number, ...args: any[]) => {
    delays.push(ms || 0);
    return original(fn as any, 0, ...args) as unknown as NodeJS.Timeout;
  }) as typeof setTimeout;

  let attempts = 0;
  const result = await retry(async () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'ok';
  }, 3, 100, 2);

  expect(result).toBe('ok');
  expect(attempts).toBe(3);
  expect(delays).toEqual([100, 200]);

  global.setTimeout = original;
});
