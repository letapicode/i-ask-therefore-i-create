variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
}

variable "region" {
  description = "Region for the cluster"
  type        = string
}

variable "initial_node_count" {
  description = "Number of nodes to start with"
  type        = number
  default     = 1
}
