# Visual Database Schema Designer

The portal provides a basic schema designer powered by React Flow. Users can drag tables and relationships onto a canvas and export the model for code generation.

This is an early prototype located at `/schema-designer`.

When a model is saved the designer POSTs the full schema to `/api/schema` in the
orchestrator. Any changes compared to the previous version are converted into
SQL statements and stored under `packages/codegen-templates/migrations`. Run
`node tools/run-migrations.js -c <connection>` to apply these migrations to your
database.
