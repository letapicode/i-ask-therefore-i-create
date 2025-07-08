# GCP Modules

Terraform modules for deploying to Google Cloud Platform.

Each subdirectory contains a reusable module. Example usage for the `artifacts` bucket is shown below:

```hcl
module "gcp_artifacts" {
  source      = "./infrastructure/gcp/artifacts"
  bucket_name = "my-artifact-bucket"
  location    = "us-central1"
}
```

Run `terraform init` and `terraform plan` inside the module directory to preview changes.
