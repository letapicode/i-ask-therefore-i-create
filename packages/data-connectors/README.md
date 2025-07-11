# Data Connectors

Example connectors that third-party services can implement. This package currently includes functional connectors for Stripe, Slack, Shopify, QuickBooks, Zendesk, Kafka, Kinesis and now Ethereum and Polygon using their HTTP APIs and SDKs. It also provides publishing helpers for the Apple App Store and Google Play.

The Kafka and Kinesis helpers now validate required options before attempting connections, throwing descriptive errors when configuration is incomplete.

TensorFlow.js models can be placed under `model/` and loaded in the browser with `tfHelper.ts` for client-side inference. Prediction helpers are also exported for server-side endpoints.
