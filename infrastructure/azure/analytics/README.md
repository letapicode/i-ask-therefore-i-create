# Analytics Cosmos DB Module

This module provisions a Cosmos DB table for analytics events.

## Usage
```hcl
module "analytics" {
  source     = "./infrastructure/analytics"
  table_name = "events"
}
```

Run `terraform init` and `terraform plan` to verify resources.
