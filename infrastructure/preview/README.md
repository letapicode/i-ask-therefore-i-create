# Preview Environments Module

This module provisions a minimal ECS service that can be used to run short-lived preview deployments.

## Usage
```hcl
module "preview" {
  source        = "./infrastructure/preview"
  name          = "my-preview"
  image         = "nginx"
  subnets       = ["subnet-123"]
  security_group = "sg-123"
}
```
Run `terraform init` then `terraform plan` to validate.
