variable "vnet_name" {
  description = "Virtual network name"
  type        = string
}

variable "address_space" {
  description = "Address space for VNet"
  type        = list(string)
}

variable "subnet_cidrs" {
  description = "CIDRs for subnets"
  type        = list(string)
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group" {
  description = "Resource group name"
  type        = string
}
