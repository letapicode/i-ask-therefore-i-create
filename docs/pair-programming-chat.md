# AI Pair Programming Chat

This service provides a live chat assistant that can read files from the repository and suggest patches.

Run `pnpm --filter @iac/pair-chat build && node services/pair-chat/dist/index.js` to start locally.

Messages are sent over WebSocket and responses include suggested code changes. Patches may contain sensitive data, so keep API keys secret and monitor token usage when using OpenAI.
