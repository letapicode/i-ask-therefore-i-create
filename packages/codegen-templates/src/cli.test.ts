import { templates } from './templates';

test('exposes templates array', () => {
  expect(Array.isArray(templates)).toBe(true);
  expect(templates.length).toBeGreaterThan(0);
  const names = templates.map((t) => t.name);
  expect(names).toContain('fastapi');
  expect(names).toContain('go');
});
