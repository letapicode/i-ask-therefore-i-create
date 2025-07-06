# Observability Module

Sets up CloudWatch Logs and X-Ray groups for application monitoring.

## Usage
```hcl
module "observability" {
  source         = "./infrastructure/observability"
  log_group_name = "app-logs"
}
```

Run `terraform init && terraform fmt` before apply.
