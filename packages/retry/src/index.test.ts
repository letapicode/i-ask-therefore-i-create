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
