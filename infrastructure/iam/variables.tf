variable "role_name" {
  description = "Name of the IAM role"
  type        = string
}

variable "assume_role_service" {
  description = "Service that can assume this role"
  type        = string
}

variable "policy_json" {
  description = "JSON policy document"
  type        = string
}
