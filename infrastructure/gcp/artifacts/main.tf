resource "google_storage_bucket" "artifacts" {
  name     = var.bucket_name
  location = var.location
  force_destroy = true
}
