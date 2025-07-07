import fs from 'fs';

const LOG_FILE = process.env.AUDIT_LOG || 'audit.log';

export function logAudit(message: string) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}
