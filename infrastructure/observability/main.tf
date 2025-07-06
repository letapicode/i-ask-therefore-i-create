resource "aws_cloudwatch_log_group" "app" {
  name = var.log_group_name
  retention_in_days = 14
}

resource "aws_xray_group" "default" {
  filter_expression = "service('all')"
  group_name        = "${var.log_group_name}-xray"
}
