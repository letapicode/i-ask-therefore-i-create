import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { uploadObject } from '../../packages/shared/src/s3';
import { logAudit } from '../../packages/shared/src/audit';

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

export async function runBackup(src: string, bucket: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  for (const file of walk(src)) {
    const body = fs.readFileSync(file);
    const key = `${stamp}/${path.relative(src, file)}`;
    await uploadObject(bucket, key, body);
  }
  logAudit(`backup uploaded to ${bucket}/${stamp}`);
  const url = process.env.ANALYTICS_URL;
  if (url) {
    fetch(`${url}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'backup', bucket, time: Date.now() }),
    }).catch(() => {});
  }
}

export function startBackupScheduler(
  intervalMs = 24 * 3600 * 1000,
  src = process.cwd(),
  bucket = process.env.BACKUP_BUCKET || ''
) {
  if (!bucket) return;
  runBackup(src, bucket).catch((err) => console.error('backup failed', err));
  setInterval(
    () => runBackup(src, bucket).catch((err) => console.error('backup failed', err)),
    intervalMs
  );
}
