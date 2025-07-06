# Automated Backups Module

This module provisions an AWS Backup vault and a simple daily backup plan. Use it to schedule backups of repositories and databases.

## Usage
```hcl
module "backups" {
  source     = "./infrastructure/backups"
  vault_name = "my-backups"
}
```
Run `terraform init` then `terraform plan` to verify resources.
