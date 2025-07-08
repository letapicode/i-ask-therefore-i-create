terraform {
  required_version = ">= 1.0"
}

provider "azurerm" {
  features = {}
  location = var.location
}

module "stack" {
  source = "../terraform"

  vpc_cidr           = var.vpc_cidr
  vpc_name           = var.vpc_name
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  availability_zones = var.availability_zones
  artifacts_bucket   = var.artifacts_bucket
}
