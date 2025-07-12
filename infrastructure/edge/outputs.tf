output "worker_id" {
  description = "ID of the Cloudflare worker"
  value       = cloudflare_worker_script.edge.id
}

output "lambda_arn" {
  description = "ARN of the Lambda@Edge function"
  value       = aws_lambda_function.edge.arn
}

output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.edge.id
}
