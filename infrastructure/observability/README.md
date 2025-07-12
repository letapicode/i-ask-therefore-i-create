# Observability Module

Sets up CloudWatch Logs, X-Ray groups, and an optional CloudWatch dashboard for monitoring the platform.

## Usage
```hcl
module "observability" {
  source         = "./infrastructure/observability"
  log_group_name = "app-logs"
  dashboard_name = "app-dashboard"
  retention_days = 30
  alarm_email    = "alerts@example.com"
}
```

Run `terraform init && terraform fmt` before apply.
If `alarm_email` is set an SNS topic and CloudWatch alarm will be created to
notify when more than `error_threshold` errors occur within five minutes.

## Viewing Traces

An OpenTelemetry collector is deployed when `subnets` and `security_group` values are provided. Services can export traces to `http://<collector address>:4318/v1/traces`. Point your Jaeger or Zipkin UI at the collector endpoint to visualize traces.
