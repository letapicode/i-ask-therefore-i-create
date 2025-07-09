# Pair Programming Chat Service

Provides a websocket endpoint that proxies requests to an LLM and returns coding suggestions.

## Endpoints

- `ws://<host>/` – send `{type: 'ask', file?: string, message: string}` and receive `{type: 'response', text: string}`.
- `POST /applyPatch` – apply a unified diff patch and commit it.

Set `OPENAI_API_KEY` or `CUSTOM_MODEL_URL` to configure the language model. Patches are committed automatically unless `TEST_MODE` is set.
