# Observability Module

Sets up Application Insights Logs, X-Ray groups, and an optional Application Insights dashboard for monitoring the platform.

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
If `alarm_email` is set an SNS topic and Application Insights alarm will be created to
notify when more than `error_threshold` errors occur within five minutes.
