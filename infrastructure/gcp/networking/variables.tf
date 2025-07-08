variable "network_name" {
  description = "Name of the network"
  type        = string
}

variable "region" {
  description = "Region for subnets"
  type        = string
}

variable "subnet_cidrs" {
  description = "CIDR ranges for subnets"
  type        = list(string)
}
