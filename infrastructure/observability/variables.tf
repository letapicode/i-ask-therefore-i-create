variable "log_group_name" {
  description = "Name for the CloudWatch log group"
  type        = string
}
variable "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  type        = string
  default     = "app-dashboard"
}

variable "retention_days" {
  description = "How many days to retain logs"
  type        = number
  default     = 14
}

variable "alarm_email" {
  description = "Email address for alarm notifications"
  type        = string
  default     = null
}

variable "error_threshold" {
  description = "Number of error logs in 5 minutes to trigger the alarm"
  type        = number
  default     = 5
}
