import fs from 'fs';

export interface RegionPolicy {
  region: string;
  retentionDays: number;
}

export function applyRetention<T extends { time?: number }>(
  list: T[],
  days?: number
): T[] {
  if (!days) return list;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return list.filter((i) => !i.time || i.time >= cutoff);
}

export function enforceRetention(file: string, days?: number) {
  if (!fs.existsSync(file) || !days) return;
  const items = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const kept = applyRetention(items, days);
  if (kept.length !== items.length) {
    fs.writeFileSync(file, JSON.stringify(kept, null, 2));
  }
}

export function getPolicy(region: string): RegionPolicy | null {
  const path = `policies/${region}.json`;
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
