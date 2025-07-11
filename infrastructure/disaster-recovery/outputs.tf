output "primary_bucket" {
  value       = aws_s3_bucket.primary.id
  description = "Primary bucket name"
}

output "replica_bucket" {
  value       = aws_s3_bucket.replica.id
  description = "Replica bucket name"
}
