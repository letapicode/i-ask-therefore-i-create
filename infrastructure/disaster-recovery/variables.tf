variable "primary_bucket" {
  description = "Name of the primary backup bucket"
  type        = string
}

variable "replica_bucket" {
  description = "Name of the replica bucket"
  type        = string
}

variable "replica_region" {
  description = "AWS region for the replica bucket"
  type        = string
}
