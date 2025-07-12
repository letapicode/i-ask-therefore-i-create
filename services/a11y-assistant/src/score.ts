export interface Violation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | string;
}

/**
 * Calculate an accessibility score from a list of violations.
 * Starts at 100 and subtracts weighted points per violation.
 */
export function calculateScore(violations: Violation[]): number {
  if (!Array.isArray(violations) || violations.length === 0) return 100;
  let penalty = 0;
  for (const v of violations) {
    switch (v.impact) {
      case 'critical':
        penalty += 5;
        break;
      case 'serious':
        penalty += 3;
        break;
      case 'moderate':
        penalty += 2;
        break;
      default:
        penalty += 1;
    }
  }
  const score = 100 - penalty * 2;
  return score < 0 ? 0 : score;
}
