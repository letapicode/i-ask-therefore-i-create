output "bucket_name" {
  description = "GCS bucket name"
  value       = google_storage_bucket.artifacts.name
}
