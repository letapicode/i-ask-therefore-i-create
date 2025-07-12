# AI-Driven Code Review Service

The code review service analyzes pull requests for common issues and posts
results back to GitHub.

## Running the Service

```bash
pnpm --filter @iac/code-review build && node services/code-review/dist/index.js
```

Send repositories to `/review`:

```bash
curl -X POST http://localhost:3013/review \
  -H 'Content-Type: application/json' \
  -d '{"repo":"/path/to/repo"}'
```

## GitHub Webhook

Configure the orchestrator `CODE_REVIEW_URL` and `GITHUB_TOKEN`. Point your
GitHub webhook to `/github/webhook`. Review summaries are stored locally and can
be viewed in the portal at `/activity`.
