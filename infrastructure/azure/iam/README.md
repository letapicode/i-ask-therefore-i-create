# Azure IAM Module

Creates a service principal with role assignments.

## Usage
```hcl
module "azure_iam" {
  source          = "./infrastructure/azure/iam"
  app_name        = "demo-sp"
  role_definition = "Contributor"
  resource_group  = "my-rg"
}
```

Run `terraform init` and `terraform plan` before applying.
