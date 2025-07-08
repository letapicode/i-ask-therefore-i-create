# GCP Container Services Module

Provision a simple GKE cluster.

## Usage
```hcl
module "gke" {
  source            = "./infrastructure/gcp/container-services"
  cluster_name      = "demo-cluster"
  region            = "us-central1"
  initial_node_count = 1
}
```

Use `terraform init` then `terraform apply` to create the cluster.
