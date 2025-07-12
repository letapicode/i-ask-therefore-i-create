# AI Code Review Service

This service performs lightweight lint and security checks on a repository.

## Usage

```bash
pnpm --filter @iac/code-review build && node services/code-review/dist/index.js
```

Send a POST request to `/review` with a `repo` path:

```bash
curl -X POST http://localhost:3013/review -d '{"repo":"/path/to/repo"}' \
  -H 'Content-Type: application/json'
```
