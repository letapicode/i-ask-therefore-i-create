# ChatOps Service

Provides a Slack bot for managing deployments through chat commands.

## Endpoints

- `POST /slack` – handle Slack slash command payloads
- `POST /api/chatops/nlp` – parse free-form text and return a command intent

Set `ORCH_URL` to the orchestrator base URL. Conversation state is saved to the file defined by `CHATOPS_CONTEXT` (default `.chatops.json`). Use `CHATOPS_TENANT` to specify which tenant ID is used for orchestrator requests.

### Commands

- `status <jobId>` – show the status of a job
- `redeploy <jobId>` – trigger a redeploy of the job
- Natural language requests like "redeploy job 123" are supported via the NLP endpoint and Slack handler.

## Setup

1. Create a Slack app and configure a slash command pointing to `/slack`.
2. Provide the bot token via the connectors page (`slackKey`).
3. Build and start the service:

```bash
pnpm --filter @iac/chatops-service build
node services/plugins/chatops/dist/index.js
```

