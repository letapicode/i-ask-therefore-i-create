# Auto Documentation Generation

The platform can summarize code and APIs to create Markdown documentation automatically.

To generate docs for a project:

1. Run `node packages/codegen-templates/src/cli.ts docs` with your project path.
2. The script analyzes source files and outputs Markdown under `docs/generated/`.

This feature helps keep READMEs up to date as code evolves.
