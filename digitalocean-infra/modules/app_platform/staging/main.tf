provider "digitalocean" {
  token = var.do_token
}

module "app_platform" {
  source = "../"

  app_name           = "ardata-staging-app"
  environment        = "staging"
  region             = var.region
  api_instance_count = var.api_instance_count
  api_instance_size  = var.api_instance_size
} 