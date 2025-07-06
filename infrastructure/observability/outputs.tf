output "log_group_arn" {
  value       = aws_cloudwatch_log_group.app.arn
  description = "ARN of the log group"
}

output "dashboard_name" {
  value       = aws_cloudwatch_dashboard.app.dashboard_name
  description = "Name of the CloudWatch dashboard"
}
