# GCP Networking Module

Provision a VPC network and subnets in Google Cloud.

## Usage
```hcl
module "gcp_network" {
  source       = "./infrastructure/gcp/networking"
  network_name = "demo"
  region       = "us-central1"
  subnet_cidrs = ["10.10.1.0/24", "10.10.2.0/24"]
}
```

Initialize with `terraform init` then run `terraform plan`.
