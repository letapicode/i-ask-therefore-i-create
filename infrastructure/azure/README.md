# Azure Modules

Terraform modules for deploying resources on Microsoft Azure.

Example for the `artifacts` storage account:

```hcl
module "azure_artifacts" {
  source         = "./infrastructure/azure/artifacts"
  resource_group = "rg-artifacts"
  account_name   = "artifactstore"
  location       = "eastus"
}
```

Initialize modules with `terraform init` and review using `terraform plan`.
