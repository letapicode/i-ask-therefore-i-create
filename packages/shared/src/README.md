# shared

Shared library code.

## DynamoDB Helpers

This package now includes DynamoDB helper functions built on the AWS SDK v3 `DynamoDBDocumentClient`:

- `putItem`
- `getItem`
- `updateItem`
- `queryItems`

## Sentry

`initSentry(serviceName)` initializes Sentry if a `SENTRY_DSN` environment variable is provided.
