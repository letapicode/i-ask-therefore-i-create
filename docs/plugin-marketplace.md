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
