# Cloudflare Worker deployment
provider "cloudflare" {
  account_id = var.cloudflare_account
}

data "cloudflare_zone" "zone" {
  name = var.cloudflare_zone
}

resource "cloudflare_worker_script" "edge" {
  name    = var.worker_name
  content = file(var.worker_script)
}

resource "cloudflare_worker_route" "route" {
  zone_id     = data.cloudflare_zone.zone.id
  pattern     = var.worker_route
  script_name = cloudflare_worker_script.edge.name
}

# AWS Lambda@Edge deployment
resource "aws_lambda_function" "edge" {
  filename      = var.lambda_package
  function_name = var.lambda_function_name
  handler       = var.lambda_handler
  runtime       = var.lambda_runtime
  publish       = true
  role          = var.lambda_role
}

resource "aws_cloudfront_distribution" "edge" {
  enabled = true

  origin {
    domain_name = var.s3_origin_domain
    origin_id   = "edge-origin"
  }

  default_cache_behavior {
    target_origin_id       = "edge-origin"
    viewer_protocol_policy = "redirect-to-https"
    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.edge.qualified_arn
      include_body = false
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
