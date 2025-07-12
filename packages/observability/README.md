# Observability Package

Initializes OpenTelemetry tracing for Node.js services. If the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable is set, traces will be exported using the OTLP HTTP protocol.

## Usage
```ts
import { initTracing } from 'observability';

initTracing('my-service');
```
