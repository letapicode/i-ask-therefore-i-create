import { runBenchmark } from '../../tools/llm-optimization/benchmark';

jest.mock('node-fetch', () => jest.fn(async () => ({
  json: async () => ({ result: 'hello world' })
})));

const fetchMock = require('node-fetch') as jest.Mock;

test('runs multiple requests and returns tokens per second', async () => {
  const tps = await runBenchmark('http://localhost', 2);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(tps).toBeGreaterThan(0);
});
