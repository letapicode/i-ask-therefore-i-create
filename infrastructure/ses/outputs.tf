output "identity_arn" {
  value       = aws_ses_domain_identity.domain.arn
  description = "SES domain identity ARN"
}
