output "log_group_arn" {
  value       = aws_cloudwatch_log_group.app.arn
  description = "ARN of the log group"
}

output "dashboard_name" {
  value       = aws_cloudwatch_dashboard.app.dashboard_name
  description = "Name of the CloudWatch dashboard"
}

output "alarm_arn" {
  value       = aws_cloudwatch_metric_alarm.error_alarm.arn
  description = "ARN of the error alarm"
  depends_on  = [aws_cloudwatch_metric_alarm.error_alarm]
}
