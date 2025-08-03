import { sanitize, sanitizeObject } from './sanitize';

test('escapes html', () => {
  expect(sanitize('<script>')).toBe('&lt;script&gt;');
});

test('sanitizes objects and arrays', () => {
  const input = {
    comment: '<b>Hello</b>',
    items: ['<img src=x>', { note: '<script>alert(1)</script>' }],
  };
  const result = sanitizeObject(input);
  expect(result.comment).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt;');
  expect(result.items[0]).toBe('&lt;img src=x&gt;');
  expect(result.items[1].note).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
});
