# Multi-Cloud Deployment

Generated apps can be deployed to AWS, GCP or Azure. Terraform modules for each
provider live under `infrastructure/<provider>`.

## Modules
- `infrastructure/gcp/networking` – VPC network and subnets
- `infrastructure/gcp/iam` – service accounts and roles
- `infrastructure/gcp/container-services` – GKE cluster
- `infrastructure/azure/networking` – virtual network and subnets
- `infrastructure/azure/iam` – service principals and role assignments
- `infrastructure/azure/container-services` – AKS cluster

Run `terraform init` in any module directory and supply provider credentials via
Terraform variables or environment settings.

## Portal Usage

When creating an app you can now choose the target provider. The orchestrator
stores this value on the job and triggers the matching deployment webhook.

## Limitations

- Only basic networking, IAM and container clusters are provisioned.
- Cross‑cloud networking is not automated.
- Deployment hooks must be implemented per provider.
