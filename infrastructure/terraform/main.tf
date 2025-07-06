module "vpc" {
  source             = "../vpc"
  vpc_cidr           = var.vpc_cidr
  vpc_name           = var.vpc_name
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  availability_zones = var.availability_zones
}

module "artifacts" {
  source      = "../artifacts"
  bucket_name = var.artifacts_bucket
}
