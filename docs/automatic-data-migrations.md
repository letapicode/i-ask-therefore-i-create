# Automatic Data Migrations

Schema changes in the designer are tracked in `schema.history.json`.
Each new revision is compared to the previous one and simple
PostgreSQL migration commands are appended to `migrations.sql`.

Run the orchestrator and update the schema via `/api/schema`.
Migration commands will be generated automatically. Review
`migrations.sql` before applying to production.
