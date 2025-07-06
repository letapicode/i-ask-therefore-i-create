resource "aws_backup_vault" "this" {
  name = var.vault_name
}

resource "aws_backup_plan" "daily" {
  name = "${var.vault_name}-plan"
  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.this.name
    schedule          = "cron(0 3 * * ? *)"
  }
}
