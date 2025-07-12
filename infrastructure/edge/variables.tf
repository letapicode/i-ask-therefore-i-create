variable "worker_name" {
  description = "Name for Cloudflare Worker"
  type        = string
  default     = "iac-worker"
}

variable "account_id" {
  description = "Cloudflare account id"
  type        = string
}

variable "lambda_role_arn" {
  description = "IAM role ARN for Lambda@Edge"
  type        = string
}

variable "lambda_source_path" {
  description = "Path to Lambda zip file"
  type        = string
}
