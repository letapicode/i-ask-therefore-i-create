import { templates } from './templates';

test('exposes templates array', () => {
  expect(Array.isArray(templates)).toBe(true);
  expect(templates.length).toBeGreaterThan(0);
});
