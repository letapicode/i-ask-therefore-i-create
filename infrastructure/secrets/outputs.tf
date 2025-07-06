output "parameter_arns" {
  description = "ARNs of created parameters"
  value       = [for p in aws_ssm_parameter.secret : p.arn]
}
