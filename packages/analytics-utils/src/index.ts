export interface UIRecommendation {
  suggestion: string;
  score: number;
}

export function rankUIAdjustments(events: any[]): UIRecommendation[] {
  const clicks = events.filter(e => e.type === 'click');
  const sessions = events.filter(e => e.type === 'sessionDuration');

  const avgSession =
    sessions.reduce((s, e) => s + (e.duration || 0), 0) /
    (sessions.length || 1);

  const recs: UIRecommendation[] = [];

  if (avgSession < 30000) {
    recs.push({
      suggestion: 'Consider moving primary actions higher on the page.',
      score: 0.8,
    });
  }

  const pathCounts: Record<string, number> = {};
  for (const c of clicks) {
    const p = c.path || 'unknown';
    pathCounts[p] = (pathCounts[p] || 0) + 1;
  }
  const entries = Object.entries(pathCounts);
  if (entries.length > 0) {
    const least = entries.sort((a, b) => a[1] - b[1])[0];
    if (least[1] <= 2) {
      recs.push({
        suggestion: `Increase visibility of '${least[0]}' button or link.`,
        score: 0.6,
      });
    }
  }

  return recs.sort((a, b) => b.score - a.score).slice(0, 5);
}
