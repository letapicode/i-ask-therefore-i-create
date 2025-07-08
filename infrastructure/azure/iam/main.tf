resource "azurerm_ad_app_registration" "app" {
  display_name = var.app_name
}

resource "azurerm_ad_service_principal" "sp" {
  application_id = azurerm_ad_app_registration.app.application_id
}

data "azurerm_resource_group" "rg" {
  name = var.resource_group
}

resource "azurerm_role_assignment" "assign" {
  scope                = data.azurerm_resource_group.rg.id
  role_definition_name = var.role_definition
  principal_id         = azurerm_ad_service_principal.sp.id
}
