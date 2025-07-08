output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.sa.email
}
