# Static Site Module

This Terraform module provisions an Azure Storage bucket and Azure CDN distribution for hosting a static website.

## Usage
```hcl
module "static_site" {
  source      = "./infrastructure/static-site"
  bucket_name = "my-site-bucket"
}
```

Initialize the module with `terraform init` then run `terraform plan` to review the changes.
