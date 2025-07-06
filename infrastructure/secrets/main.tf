resource "aws_ssm_parameter" "secret" {
  for_each = var.parameters

  name  = each.key
  type  = "SecureString"
  value = each.value
}
