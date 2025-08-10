provider "digitalocean" {
  token = var.do_token
}

# Compute Module
module "compute" {
  source = "../../modules/compute"

  name           = "ardata-staging"
  image          = var.droplet_image
  region         = var.region
  size           = var.droplet_size
  instance_count = var.droplet_count
  ssh_keys       = var.ssh_keys
  vpc_uuid       = var.vpc_uuid
  tags           = ["staging", "ardata"]

  monitoring = true
  backups    = false
  ipv6       = true

  private_key_path = var.private_key_path

  enable_loadbalancer = true
  lb_entry_port      = 80
  lb_entry_protocol  = "http"
  lb_target_port     = 80
  lb_target_protocol = "http"

  lb_healthcheck_port     = 80
  lb_healthcheck_protocol = "http"
  lb_healthcheck_path     = "/health"

  lb_redirect_http_to_https = true
  lb_enable_proxy_protocol  = false
}
