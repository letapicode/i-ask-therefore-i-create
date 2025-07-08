# Cloud IAM Roles Module

This Terraform module creates Cloud IAM roles with attached policies so services can operate with least privilege.

## Usage
```hcl
module "iam" {
  source            = "./infrastructure/iam"
  role_name         = "demo-role"
  assume_role_service = "lambda.amazonaws.com"
  policy_json       = file("./policy.json")
}
```

Run `terraform init` and `terraform fmt` in this directory before applying.
