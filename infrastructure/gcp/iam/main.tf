resource "google_service_account" "sa" {
  account_id   = var.account_id
  display_name = var.display_name
}

resource "google_project_iam_custom_role" "role" {
  count       = length(var.permissions) > 0 ? 1 : 0
  role_id     = var.role_id
  title       = var.role_id
  permissions = var.permissions
}

resource "google_service_account_iam_member" "binding" {
  count  = length(var.permissions) > 0 ? 1 : 0
  service_account_id = google_service_account.sa.name
  role    = google_project_iam_custom_role.role[0].name
  member  = "serviceAccount:${google_service_account.sa.email}"
}
