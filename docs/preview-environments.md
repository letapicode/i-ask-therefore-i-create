# Preview Environments

When `/api/createApp` is called with `preview=true`, the orchestrator launches a short-lived Docker container for the generated app. The container exposes a random port on localhost and the preview URL is returned when checking job status.

Preview containers automatically stop after the time configured by `PREVIEW_TTL_MS` (default one hour). A background task cleans up any expired containers to avoid resource leaks.

Set `PREVIEW_IMAGE` to control the Docker image used. This can point to an image built from the generated code or a base image for testing.

Use the portal's app list or status page to open the preview link while it is active.
