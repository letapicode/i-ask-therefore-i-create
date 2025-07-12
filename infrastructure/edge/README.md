# Edge Deployment Modules

This folder contains optional Terraform modules for deploying applications to edge networks like Cloudflare Workers and AWS Lambda@Edge.

## Usage

```hcl
module "edge" {
  source               = "./infrastructure/edge"
  cloudflare_account   = var.cloudflare_account
  cloudflare_zone      = var.cloudflare_zone
  lambda_function_arn  = var.lambda_function_arn
}
```

Initialize and format the module with:

```bash
terraform init
terraform fmt
```
