output "cloudflare_worker" {
  description = "Deployed Cloudflare worker name"
  value       = cloudflare_worker_script.edge.name
}

output "cloudfront_distribution" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.edge.id
}
