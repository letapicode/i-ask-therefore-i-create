# Prompt Store Service

This service keeps versions of the prompt templates used by the code generation pipeline.

## Endpoints

- `GET /prompts` – list all stored prompts
- `POST /prompts` – create a new prompt `{ name, text }`
- `GET /prompts/:id` – return a prompt and its version history
- `PUT /prompts/:id` – add a new version `{ text }`
- `DELETE /prompts/:id` – remove a prompt

The store uses a simple JSON file defined by `PROMPT_DB` (default `.prompts.json`). Each update appends a new version with a timestamp so changes can be audited and rolled back.

Run with `node dist/index.js` after building.
