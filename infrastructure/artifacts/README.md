# Artifact Storage Module

This module provisions an S3 bucket for storing build artifacts. Versioning is
enabled so previous outputs can be retained.

## Usage

```hcl
module "artifacts" {
  source      = "./infrastructure/artifacts"
  bucket_name = "my-artifacts-bucket"
}
```

Initialize with `terraform init` and review with `terraform plan`.
