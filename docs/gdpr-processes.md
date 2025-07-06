# GDPR Data Processes

Users may request a copy of their stored data or ask for deletion at any time.
The `tools/export-data.js` script assists with these requests.

## Exporting Data

```bash
node tools/export-data.js --tenant user@example.com --out user-data.json
```

This command writes all job records for the tenant to `user-data.json`.

## Deleting Data

Add the `--delete` flag to remove the records after export:

```bash
node tools/export-data.js --tenant user@example.com --delete
```

Always confirm the requester before performing deletion.
