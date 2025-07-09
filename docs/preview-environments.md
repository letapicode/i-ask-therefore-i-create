# On-Demand Preview Environments

Preview environments allow each pull request to be tested without a full deployment. The orchestrator can launch a short-lived container using the `startPreview` helper.

Set `PREVIEW_IMAGE` to the container image and optionally `PREVIEW_TTL_MS` for the lifetime. When creating an app, pass `{ preview: true }` and the API will return `previewUrl` and `previewExpires` fields.

A GitHub workflow (`ci/preview.yml`) demonstrates how to start a preview on every pull request.
