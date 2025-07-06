resource "aws_db_instance" "db" {
  identifier        = var.identifier
  engine            = "postgres"
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  username          = var.username
  password          = var.password
  skip_final_snapshot = true
  storage_encrypted = true
}
