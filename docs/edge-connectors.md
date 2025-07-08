# Edge Inference & Data Connectors

Connectors for services like Stripe and Slack can be configured in the portal under `/connectors`. Keys are stored via the orchestrator and used by packages in `@iac/data-connectors`. The connectors now perform real API calls.

## Available Connectors

- **stripe** – provide `stripeKey` from your account
- **slack** – provide a bot `slackKey`
- **kafka** – specify `brokers`, `topic` and optional SASL credentials
- **kinesis** – specify `streamName` and AWS credentials

Keys are managed via the `/api/connectors` endpoints:

- `GET /api/connectors` – retrieve saved keys for the current tenant
- `POST /api/connectors` – update one or more keys
- `DELETE /api/connectors/:type` – remove a saved key

This also enables optional TensorFlow.js models to run predictions in the browser for offline support.
Use `/api/predict` to test models through the portal's connectors page.

### Kafka Example

```ts
import { produceKafka, consumeKafka } from '@iac/data-connectors';

await produceKafka(
  { brokers: ['localhost:9092'], topic: 'demo' },
  'hello world'
);

consumeKafka(
  { brokers: ['localhost:9092'], topic: 'demo' },
  async (msg) => console.log(msg)
);
```

### Kinesis Setup

```ts
import { putKinesis, consumeKinesis } from '@iac/data-connectors';

await putKinesis(
  { streamName: 'demo', region: 'us-east-1' },
  'hello'
);

consumeKinesis(
  { streamName: 'demo', region: 'us-east-1' },
  async (data) => console.log(data)
);
```
