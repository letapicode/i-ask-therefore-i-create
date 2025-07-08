variable "location" { type = string }
variable "vpc_cidr" { type = string }
variable "vpc_name" { type = string }
variable "public_subnets" { type = list(string) }
variable "private_subnets" { type = list(string) }
variable "availability_zones" { type = list(string) }
variable "artifacts_bucket" { type = string }
