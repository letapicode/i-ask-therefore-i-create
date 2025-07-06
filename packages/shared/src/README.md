# shared

Shared library code.

## DynamoDB Helpers

This package now includes `putItem` and `getItem` helpers built on the AWS SDK v3 `DynamoDBDocumentClient`.

## Sentry

`initSentry(serviceName)` initializes Sentry if a `SENTRY_DSN` environment variable is provided.
