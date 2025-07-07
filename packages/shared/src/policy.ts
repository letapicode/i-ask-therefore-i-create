import fs from 'fs';

export interface RegionPolicy {
  region: string;
  retentionDays: number;
}

export function getPolicy(region: string): RegionPolicy | null {
  const path = `policies/${region}.json`;
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
