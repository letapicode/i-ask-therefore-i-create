resource "aws_s3_bucket" "lake" {
  bucket = var.bucket_name
}

resource "aws_glue_catalog_database" "db" {
  name = "${var.environment}-lake"
}
