# Edge Inference & Data Connectors

Connectors for services like Stripe and Slack can be configured in the portal under `/connectors`. Keys are stored via the orchestrator and used by packages in `@iac/data-connectors`. The connectors now perform real API calls.

This also enables optional TensorFlow.js models to run predictions in the browser for offline support.
