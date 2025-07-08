import { rankUIAdjustments } from './index';

const events = [
  { type: 'click', path: '/signup' },
  { type: 'click', path: '/signup' },
  { type: 'click', path: '/help' },
  { type: 'sessionDuration', duration: 10000 },
  { type: 'sessionDuration', duration: 20000 },
];

test('generates recommendations array', () => {
  const recs = rankUIAdjustments(events);
  expect(Array.isArray(recs)).toBe(true);
  expect(recs.length).toBeGreaterThan(0);
});
