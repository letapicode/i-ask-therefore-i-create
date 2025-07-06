# Cognito Module

This module provisions a user pool and app client used for authentication.

## Usage
```hcl
module "cognito" {
  source          = "./infrastructure/cognito"
  user_pool_name  = "demo-users"
  app_client_name = "demo-client"
}
```

Run `terraform init` then `terraform plan` to review resources.
