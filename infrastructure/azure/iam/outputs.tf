output "service_principal_id" {
  description = "ID of the created service principal"
  value       = azurerm_ad_service_principal.sp.id
}
