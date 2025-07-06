import { sanitize } from './sanitize';

test('escapes html', () => {
  expect(sanitize('<script>')).toBe('&lt;script&gt;');
});
