resource "aws_appautoscaling_target" "edge" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "function:${var.function_name}:${var.function_version}"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

resource "aws_appautoscaling_policy" "edge" {
  name               = "${var.function_name}-tracking"
  service_namespace  = aws_appautoscaling_target.edge.service_namespace
  resource_id        = aws_appautoscaling_target.edge.resource_id
  scalable_dimension = aws_appautoscaling_target.edge.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    target_value = var.target_utilization
    predefined_metric_specification {
      predefined_metric_type = "LambdaProvisionedConcurrencyUtilization"
    }
  }
}
