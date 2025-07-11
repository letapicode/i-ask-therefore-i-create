import { recordQuery } from './queryProfiler';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mocked = fetch as jest.MockedFunction<typeof fetch>;

test('recordQuery posts stats', async () => {
  mocked.mockResolvedValue({ ok: true } as any);
  await recordQuery('app1', 'SELECT', 10);
  expect(mocked).toHaveBeenCalled();
});
