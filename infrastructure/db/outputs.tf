output "endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.db.address
}
