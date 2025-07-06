# Observability Module

Sets up CloudWatch Logs, X-Ray groups, and an optional CloudWatch dashboard for monitoring the platform.

## Usage
```hcl
module "observability" {
  source         = "./infrastructure/observability"
  log_group_name = "app-logs"
  dashboard_name = "app-dashboard"
}
```

Run `terraform init && terraform fmt` before apply.
