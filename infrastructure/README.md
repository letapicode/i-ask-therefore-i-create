# Infrastructure Modules

This folder contains Terraform modules used to provision cloud resources for the platform.

## Deployment

Run the following commands from this directory to deploy the infrastructure:

```bash
terraform init
terraform plan
```

Apply the plan with `terraform apply` when you're ready to create or update resources.

Each subfolder under `infrastructure/` represents a reusable module. Before
running the commands above ensure your AWS credentials are configured and any
required variables are set either via `terraform.tfvars` or environment
variables.

Example for the VPC module:

```bash
cd vpc
terraform init
terraform plan -var-file=example.tfvars
```
