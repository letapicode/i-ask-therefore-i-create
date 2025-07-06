# Instructions for Codex

- Binary files are not supported by Codex. Avoid generating them directly. Instead, create placeholder directories (e.g., `binary-assets/`) and add a README describing the expected contents.
- There are currently no automated tests. If tests are added later, document how to run them here so Codex can execute them during PR creation.
- Commit all changes to the main branch. No new branches should be created by Codex.
- When committing, follow the project's existing style and structure. Documentation should be in Markdown.
- Provide concise PR titles and detailed descriptions summarizing the changes and referencing relevant files.
- After committing changes, append a short summary to `steps_summary.md` that explains what was done, how, and why. Include this summary with every pull request.
