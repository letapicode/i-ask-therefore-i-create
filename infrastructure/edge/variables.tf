variable "cloudflare_account" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone" {
  description = "DNS zone for Cloudflare"
  type        = string
}

variable "worker_name" {
  description = "Name of the worker script"
  type        = string
}

variable "worker_script" {
  description = "Path to the Cloudflare worker script"
  type        = string
}

variable "worker_route" {
  description = "Route pattern for the worker"
  type        = string
}

variable "lambda_package" {
  description = "Path to Lambda@Edge zip package"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda@Edge function"
  type        = string
}

variable "lambda_handler" {
  description = "Handler for the Lambda@Edge function"
  type        = string
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda@Edge function"
  type        = string
}

variable "lambda_role" {
  description = "IAM role for the Lambda function"
  type        = string
}

variable "s3_origin_domain" {
  description = "Domain of the S3 bucket origin"
  type        = string
}
