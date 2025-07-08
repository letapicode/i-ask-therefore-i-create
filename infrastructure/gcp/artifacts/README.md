# Artifact Storage Module

This module provisions an Cloud Storage bucket for storing build artifacts. Versioning is
enabled so previous outputs can be retained.

## Usage

```hcl
module "artifacts" {
  source      = "./infrastructure/artifacts"
  bucket_name = "my-artifacts-bucket"
}
```

Initialize with `terraform init` and review with `terraform plan`.
