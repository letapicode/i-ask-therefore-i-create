# VPC Module

This Terraform module provisions the base networking layer used by the platform.
It creates a VPC along with public and private subnets.

## Usage

```hcl
module "vpc" {
  source             = "./infrastructure/vpc"
  vpc_cidr           = "10.0.0.0/16"
  vpc_name           = "demo"
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets    = ["10.0.101.0/24", "10.0.102.0/24"]
  availability_zones = ["us-east-1a", "us-east-1b"]
}
```

Initialize and format the module with:

```bash
terraform init
terraform fmt
```
