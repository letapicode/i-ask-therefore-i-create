variable "log_group_name" {
  description = "Name for the CloudWatch log group"
  type        = string
}
variable "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  type        = string
  default     = "app-dashboard"
}
