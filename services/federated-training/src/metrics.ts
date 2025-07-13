import fs from 'fs';

export interface PrivacyMetric {
  time: number;
  noise: number;
  optedIn: number;
  updates: number;
}

const METRICS_FILE =
  process.env.PRIVACY_METRICS_FILE || '.privacy-metrics.json';

function readMetrics(): PrivacyMetric[] {
  if (!fs.existsSync(METRICS_FILE)) return [];
  return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8')) as PrivacyMetric[];
}

function saveMetrics(list: PrivacyMetric[]) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify(list, null, 2));
}

export function recordMetric(noise: number, optedIn: number, updates: number) {
  const list = readMetrics();
  list.push({ time: Date.now(), noise, optedIn, updates });
  saveMetrics(list);
}

export function getMetrics(): PrivacyMetric[] {
  return readMetrics();
}
