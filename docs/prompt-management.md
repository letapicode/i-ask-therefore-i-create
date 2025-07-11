# Prompt Versioning and Management

Prompt templates evolve over time as we refine code generation. The prompt store service keeps a history of each change so previous versions can be reviewed or restored.

## Usage

1. Start `services/prompt-store` and ensure the portal is running.
2. Navigate to `/prompts` in the portal to create or edit templates.
3. Edits are saved as new versions. Use the **Diff** button to see changes before saving.
4. The service stores data in `PROMPT_DB` (default `.prompts.json`).

Version history can be used by analytics to optimize prompts automatically.
