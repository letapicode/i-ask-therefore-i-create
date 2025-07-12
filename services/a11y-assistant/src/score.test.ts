import { calculateScore } from './score';

test('returns 100 when no violations', () => {
  expect(calculateScore([])).toBe(100);
});

test('calculates weighted score', () => {
  const v = [
    { id: 'a', impact: 'minor' },
    { id: 'b', impact: 'serious' },
    { id: 'c', impact: 'critical' },
  ];
  const score = calculateScore(v);
  // penalty = 1 + 3 + 5 = 9 => 100 - 18 = 82
  expect(score).toBe(82);
});
