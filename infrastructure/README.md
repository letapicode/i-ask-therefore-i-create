# Infrastructure Modules

This folder contains Terraform modules used to provision cloud resources for the platform. Modules under the root of `infrastructure/` target AWS. Two additional folders provide equivalent modules for Azure and GCP.

```
infrastructure/
  azure/      # Azure implementations
  gcp/        # Google Cloud implementations
  <aws modules>
```

## Deployment

Choose the folder that matches your cloud provider, then run Terraform as usual. For example to deploy on Azure:

```bash
cd infrastructure/azure/terraform
terraform init
terraform plan
```

The module interfaces are kept consistent so switching providers only requires pointing Terraform at the desired directory.
