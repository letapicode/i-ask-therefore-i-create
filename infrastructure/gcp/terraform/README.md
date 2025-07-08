# Terraform Scaffolding

This directory links together the individual infrastructure modules for a full deployment.

## Usage
```hcl
module "stack" {
  source             = "./infrastructure/terraform"
  vpc_cidr           = "10.0.0.0/16"
  vpc_name           = "demo"
  public_subnets     = ["10.0.1.0/24"]
  private_subnets    = ["10.0.101.0/24"]
  availability_zones = ["us-east-1a"]
  artifacts_bucket   = "demo-artifacts"
}
```

Run `terraform init` then `terraform plan` to verify.
