# GCP Artifact Bucket

Provisions a Google Cloud Storage bucket for storing build artifacts.

## Usage

```hcl
module "gcp_artifacts" {
  source      = "./infrastructure/gcp/artifacts"
  bucket_name = "my-artifact-bucket"
  location    = "us-central1"
}
```
