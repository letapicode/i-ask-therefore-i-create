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

## S3 Helper

`uploadObject(bucket, key, body)` uploads a build artifact to the specified S3 bucket.
