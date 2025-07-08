resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  address_space       = var.address_space
  location            = var.location
  resource_group_name = var.resource_group
}

resource "azurerm_subnet" "subnets" {
  count               = length(var.subnet_cidrs)
  name                = "${var.vnet_name}-subnet-${count.index}"
  resource_group_name = var.resource_group
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes    = [var.subnet_cidrs[count.index]]
}
