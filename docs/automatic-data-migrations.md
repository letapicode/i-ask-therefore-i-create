# Automatic Data Migrations

Schema changes in the designer are tracked in `schema.history.json`.
Each new revision is compared to the previous one and simple
PostgreSQL migration commands are appended to `migrations.sql`.

Run the orchestrator and update the schema via `/api/schema`.
Migration commands will be generated automatically. Review
`migrations.sql` before applying to production. Use the provided
`tools/run-migrations.js` script to execute pending migrations
against your PostgreSQL database:

```bash
pnpm run migrate -- --connection postgres://user:pass@localhost:5432/db
```

The script maintains a `migrations` table and only applies files that
have not been executed yet.
