# Backup Procedures

Run `node tools/backup.js` nightly via cron to copy service data into the `backups/` directory. Logs are written via `logAudit` for traceability.

Restore by copying a dated folder back to the service directory.
