resource "aws_cloudwatch_log_group" "app" {
  name              = var.log_group_name
  retention_in_days = var.retention_days
}

resource "aws_xray_group" "default" {
  filter_expression = "service('all')"
  group_name        = "${var.log_group_name}-xray"
}

resource "aws_cloudwatch_dashboard" "app" {
  dashboard_name = var.dashboard_name
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "log",
        properties = {
          query = "fields @timestamp, @message | filter @logStream like /${aws_cloudwatch_log_group.app.name}/",
        }
      }
    ]
  })
}

resource "aws_sns_topic" "alarm" {
  count = var.alarm_email == null ? 0 : 1
  name  = "${var.log_group_name}-alarms"
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alarm_email == null ? 0 : 1
  topic_arn = aws_sns_topic.alarm[0].arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

resource "aws_cloudwatch_log_metric_filter" "errors" {
  name           = "error-count"
  log_group_name = aws_cloudwatch_log_group.app.name
  pattern        = "ERROR"
  metric_transformation {
    name      = "ErrorCount"
    namespace = "App"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "error_alarm" {
  alarm_name          = "${var.log_group_name}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = aws_cloudwatch_log_metric_filter.errors.metric_transformation[0].name
  namespace           = aws_cloudwatch_log_metric_filter.errors.metric_transformation[0].namespace
  period              = 300
  statistic           = "Sum"
  threshold           = var.error_threshold
  alarm_actions       = var.alarm_email == null ? [] : [aws_sns_topic.alarm[0].arn]
}
