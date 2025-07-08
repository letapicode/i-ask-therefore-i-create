# Azure Container Services Module

Provisions an AKS cluster.

## Usage
```hcl
module "aks" {
  source         = "./infrastructure/azure/container-services"
  cluster_name   = "demo-aks"
  location       = "eastus"
  resource_group = "my-rg"
  node_count     = 1
}
```

Initialize with `terraform init` and review with `terraform plan`.
