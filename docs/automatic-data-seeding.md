# Automatic Data Seeding

The platform can generate realistic seed data for demo purposes. After creating an application you can request sample rows from the `/seed-data` page in the portal. The orchestrator calls the `generateSeedData` utility which uses the configured language model to produce JSON records for your current schema.

```
POST /api/seedData/<jobId>
{ "rows": 5 }
```

Generated data is stored under `seeds/<jobId>.json` and can be loaded by development databases or testing scripts.
