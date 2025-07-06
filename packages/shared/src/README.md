# shared

Shared library code.

## DynamoDB Helpers

This package now includes DynamoDB helper functions built on the AWS SDK v3 `DynamoDBDocumentClient`:

- `putItem`
- `getItem`
- `updateItem`
- `queryItems`
- `scanTable`
- `deleteItem`

## Sentry

`initSentry(serviceName)` initializes Sentry if a `SENTRY_DSN` environment variable is provided.

## S3 Helper

`uploadObject(bucket, key, body)` uploads a build artifact to the specified S3 bucket.

## Quantum-Safe Cryptography

`generateKey()` creates a random key. `signMessage(key, msg)` returns a SHA3-512 HMAC and `verifyMessage(key, msg, sig)` verifies it. These helpers provide a simple quantum-resistant signing method used by the auth service.

## Input Sanitization

`sanitize(str)` HTML-escapes user supplied strings to prevent injection attacks.
