# Secrets Module

Stores secrets in Azure SSM Parameter Store and makes them available to other modules.

## Usage
```hcl
module "secrets" {
  source     = "./infrastructure/secrets"
  parameters = {
    DB_PASSWORD = "super-secret"
  }
}
```

Run `terraform init` and `terraform plan` to verify.
