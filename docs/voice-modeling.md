# Voice-Guided Data Modeling

The `voice-modeling` page captures speech via the Web Speech API and converts simple commands into table definitions. Saying for example

```
table users id int name string
table posts id int title string
```

will produce a schema with two tables and the specified fields. The parsed schema can be saved via the "Save Schema" button which POSTs to `/api/schema` in the orchestrator.

Supported keywords:

- `table <name>` – start a new table
- `<field> <type>` – add field and type until the next `table`

Results are stored in `schema.json` server side and can be loaded by the schema designer.
