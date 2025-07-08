variable "resource_group" {
  description = "Name of the resource group"
  type        = string
}

variable "account_name" {
  description = "Storage account name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}
