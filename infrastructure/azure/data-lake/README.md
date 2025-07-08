# Data Lake Module

Provision an Azure Storage bucket and Glue catalog for a simple data lake.

## Usage

```hcl
module "data_lake" {
  source        = "./infrastructure/data-lake"
  bucket_name   = "my-data-lake"
  environment   = "dev"
}
```

Run `terraform init` and `terraform plan` to validate.
