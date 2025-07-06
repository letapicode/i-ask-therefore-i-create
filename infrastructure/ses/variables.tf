variable "domain" {
  description = "Domain for SES identity"
  type        = string
}

variable "template_name" {
  description = "Name of the default email template"
  type        = string
  default     = "default"
}

variable "template_subject" {
  description = "Subject line for the default template"
  type        = string
  default     = "Notification"
}

variable "template_html" {
  description = "HTML body for the default template"
  type        = string
  default     = "<h1>Hello</h1>"
}

variable "template_text" {
  description = "Text body for the default template"
  type        = string
  default     = "Hello"
}
