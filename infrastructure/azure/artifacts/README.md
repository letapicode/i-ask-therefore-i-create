# Azure Artifact Storage

Creates a storage account in a resource group for artifact uploads.

## Usage

```hcl
module "azure_artifacts" {
  source         = "./infrastructure/azure/artifacts"
  resource_group = "rg-artifacts"
  account_name   = "artifactstore"
  location       = "eastus"
}
```
