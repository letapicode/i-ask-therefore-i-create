variable "app_name" {
  description = "Name for the app registration"
  type        = string
}

variable "role_definition" {
  description = "Built-in role name"
  type        = string
}

variable "resource_group" {
  description = "Resource group to scope the role to"
  type        = string
}
