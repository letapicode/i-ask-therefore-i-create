# Azure Networking Module

Creates a virtual network and subnets.

## Usage
```hcl
module "az_network" {
  source        = "./infrastructure/azure/networking"
  vnet_name     = "demo-vnet"
  address_space = ["10.20.0.0/16"]
  subnet_cidrs  = ["10.20.1.0/24"]
  location      = "eastus"
  resource_group = "rg"
}
```

Initialize with `terraform init` before applying.
