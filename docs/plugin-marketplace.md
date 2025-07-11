# Plugin Marketplace

A central catalog for sharing and rating plugins built with `@iac/plugins`. Users can browse available modules and install them via the portal interface.

## Submitting a Plugin

1. Develop your module using the `@iac/plugins` package.
2. Submit it to the marketplace with:

```bash
curl -X POST http://localhost:3005/plugins \
 -H 'Content-Type: application/json' \
 -d '{"name":"my-plugin","description":"Adds auth"}'
```

3. The plugin will appear on the `/plugins` page where others can install and rate it.

## Paid Plugins

Provide a `price` in USD when submitting to enable purchases:

```bash
curl -X POST http://localhost:3005/plugins \
  -H 'Content-Type: application/json' \
  -d '{"name":"pro-plugin","description":"Advanced","price":10}'
```

Users purchase via `POST /purchase` and receive a `licenseKey` which must be supplied when installing the plugin.

## Installing the ChatOps Assistant

The ChatOps Assistant plugin enables Slack commands for managing deployments.

1. Add the plugin to the marketplace if it is not already listed:

```bash
curl -X POST http://localhost:3005/plugins \
  -H 'Content-Type: application/json' \
  -d '{"name":"chatops","description":"Slack deployment assistant"}'
```

2. Build and start the service:

```bash
pnpm --filter @iac/chatops-service build
node services/plugins/chatops/dist/index.js
```

3. Configure a Slack slash command pointing to `http://localhost:3014/slack` and
   supply your bot token via the connectors page (`slackKey`).
