import { anonymizeObject } from './pii';

test('anonymizes known PII fields', () => {
  const input = { email: 'test@example.com', age: 20 };
  const result = anonymizeObject(input);
  expect(result.email).toBe('[REDACTED]');
  expect(result.age).toBe(20);
});
