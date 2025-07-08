resource "azurerm_resource_group" "artifacts" {
  name     = var.resource_group
  location = var.location
}

resource "azurerm_storage_account" "artifacts" {
  name                     = var.account_name
  resource_group_name      = azurerm_resource_group.artifacts.name
  location                 = azurerm_resource_group.artifacts.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
