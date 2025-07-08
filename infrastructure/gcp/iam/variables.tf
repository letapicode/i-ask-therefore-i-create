variable "account_id" {
  description = "Service account ID"
  type        = string
}

variable "display_name" {
  description = "Display name"
  type        = string
}

variable "role_id" {
  description = "Custom role ID"
  type        = string
  default     = "customRole"
}

variable "permissions" {
  description = "Permissions for the custom role"
  type        = list(string)
  default     = []
}
