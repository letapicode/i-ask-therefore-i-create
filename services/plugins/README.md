# Plugins Service

Stores installation counts and user ratings for marketplace plugins.

## Endpoints

- `POST /install` – record that a plugin was installed
- `POST /remove` – record that a plugin was removed
- `POST /rate` – submit a numeric rating for a plugin
- `GET /stats` – fetch install and rating statistics

Run with `node dist/index.js` after building.
