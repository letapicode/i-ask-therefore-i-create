# Edge Deployment Module

This Terraform module provisions resources for edge deployments using Cloudflare Workers and AWS Lambda@Edge.

## Usage

```hcl
module "edge" {
  source            = "./infrastructure/edge"
  worker_name       = "my-worker"
  account_id        = var.cloudflare_account_id
  lambda_role_arn   = aws_iam_role.edge.arn
  lambda_source_path = "lambda.zip"
}
```

Initialize and format the module with:

```bash
terraform init
terraform fmt
```
