process.env.PRIVACY_METRICS_FILE = '.metrics.test.json';
import fs from 'fs';
import { recordMetric, getMetrics } from './metrics';

afterEach(() => {
  if (fs.existsSync('.metrics.test.json')) fs.unlinkSync('.metrics.test.json');
});

test('records and reads metrics', () => {
  recordMetric(0.1, 2, 5);
  const list = getMetrics();
  expect(list.length).toBe(1);
  expect(list[0].noise).toBe(0.1);
  expect(list[0].optedIn).toBe(2);
  expect(list[0].updates).toBe(5);
});
