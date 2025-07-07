# Codegen Templates

This package contains reusable templates for the code generation service.

## CLI

Run `pnpm codegen` to list available templates:

```bash
pnpm exec ts-node packages/codegen-templates/src/cli.ts
```

Additional templates can be registered at runtime using `marketplace.ts`.
\nIncludes templates for Node.js plus experimental FastAPI, Go and mobile projects.
