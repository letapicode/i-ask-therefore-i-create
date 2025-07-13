# Edge Auto-Scaling

This module configures automatic scaling for Lambda@Edge functions. The
`auto-scaling.tf` Terraform file registers the function as a scalable target and
applies a target tracking policy based on provisioned concurrency
utilization.

## Usage

```
module "edge" {
  source          = "./infrastructure/edge"
  # ...existing variables
}

module "edge_autoscaling" {
  source              = "./infrastructure/edge/auto-scaling.tf"
  function_name       = aws_lambda_function.edge.function_name
  function_version    = aws_lambda_function.edge.version
  min_capacity        = 1
  max_capacity        = 10
}
```

Run `terraform init && terraform plan` to validate the configuration. Metrics
emitted from the edge worker will be stored by the analytics service and can be
used to tune scaling thresholds.
