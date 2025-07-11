# Disaster Recovery Module

This Terraform module provisions S3 buckets with cross-region replication enabled. Use it to replicate backups to a secondary region for improved resiliency.

## Usage
```hcl
module "disaster_recovery" {
  source          = "./infrastructure/disaster-recovery"
  primary_bucket  = "my-primary-backups"
  replica_bucket  = "my-secondary-backups"
  replica_region  = "us-west-2"
}
```
Run `terraform init && terraform fmt` then `terraform plan` to validate resources.
