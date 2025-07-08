# Infrastructure Modules

This folder contains Terraform modules used to provision cloud resources for the platform.
Modules are grouped by provider:

- root modules (AWS)
- `gcp/` – Google Cloud Platform examples
- `azure/` – Microsoft Azure examples

## Deployment

Run the following commands from this directory to deploy the infrastructure:

```bash
terraform init
terraform plan
```

Apply the plan with `terraform apply` when you're ready to create or update resources.

Each subfolder under `infrastructure/` represents a reusable module. Before
running the commands above ensure credentials for your chosen provider are configured
and any required variables are set either via `terraform.tfvars` or environment
variables. Example variable files are provided for GCP and Azure under their
respective directories.

Example for the VPC module:

```bash
cd vpc
terraform init
terraform plan -var-file=example.tfvars
```
