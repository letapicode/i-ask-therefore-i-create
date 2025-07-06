output "bucket_name" {
  description = "Static site bucket name"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.cdn.domain_name
}
