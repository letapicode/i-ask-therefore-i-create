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

resource "cloudflare_worker_script" "edge" {
  name    = var.worker_name
  content = file("${path.module}/worker.js")
}

resource "aws_lambda_function" "edge" {
  function_name = "${var.worker_name}-edge"
  filename      = var.lambda_source_path
  handler       = "index.handler"
  role          = var.lambda_role_arn
  runtime       = "nodejs18.x"
  publish       = true
}

resource "aws_cloudfront_distribution" "edge" {
  enabled = true
  default_cache_behavior {
    target_origin_id       = "origin"
    viewer_protocol_policy = "redirect-to-https"
    lambda_function_association {
      event_type = "viewer-request"
      lambda_arn = aws_lambda_function.edge.qualified_arn
    }
  }
  origin {
    domain_name = "example.com"
    origin_id   = "origin"
  }
}
