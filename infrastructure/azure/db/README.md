# PostgreSQL Module

This module provisions an encrypted PostgreSQL instance using Azure RDS.

## Usage
```hcl
module "db" {
  source          = "./infrastructure/db"
  identifier      = "mydb"
  instance_class  = "db.t3.micro"
  allocated_storage = 20
  username        = "postgres"
  password        = "changeme"
}
```

Initialize with `terraform init` and run `terraform plan` to verify resources.
