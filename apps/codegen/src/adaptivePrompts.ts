import fs from 'fs';

export interface AnalyticsEntry {
  prompt: string;
  rating: number;
}

export function updatePrompts(analyticsPath = 'analytics.json') {
  if (!fs.existsSync(analyticsPath)) return;
  const data: AnalyticsEntry[] = JSON.parse(
    fs.readFileSync(analyticsPath, 'utf8')
  );
  // naive example: log average rating per prompt
  const ratings: Record<string, number[]> = {};
  for (const entry of data) {
    ratings[entry.prompt] = ratings[entry.prompt] || [];
    ratings[entry.prompt].push(entry.rating);
  }
  for (const [prompt, values] of Object.entries(ratings)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    console.log(`Prompt:"${prompt}" avg rating: ${avg.toFixed(2)}`);
  }
}
