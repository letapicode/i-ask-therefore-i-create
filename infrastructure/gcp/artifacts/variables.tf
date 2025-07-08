variable "bucket_name" {
  description = "Name of the GCS bucket"
  type        = string
}

variable "location" {
  description = "GCP region for the bucket"
  type        = string
  default     = "us-central1"
}
