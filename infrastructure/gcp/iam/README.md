# GCP IAM Module

Creates a service account and optional custom role.

## Usage
```hcl
module "gcp_iam" {
  source       = "./infrastructure/gcp/iam"
  account_id   = "demo-sa"
  display_name = "Demo Service Account"
  role_id      = "demoRole"
  permissions  = ["storage.objectViewer"]
}
```

Run `terraform init` and `terraform plan` to preview changes.
