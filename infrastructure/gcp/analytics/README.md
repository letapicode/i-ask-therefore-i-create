# Analytics Datastore Module

This module provisions a Datastore table for analytics events.

## Usage
```hcl
module "analytics" {
  source     = "./infrastructure/analytics"
  table_name = "events"
}
```

Run `terraform init` and `terraform plan` to verify resources.
