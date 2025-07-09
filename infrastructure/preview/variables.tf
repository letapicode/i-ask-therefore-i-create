variable "name" { type = string }
variable "image" { type = string }
variable "subnets" { type = list(string) }
variable "security_group" { type = string }
variable "container_port" { type = number, default = 3000 }
