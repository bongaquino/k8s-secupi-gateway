resource "digitalocean_droplet" "droplet" {
  count  = var.instance_count
  image  = var.image
  name   = "${var.name}-${count.index + 1}"
  region = var.region
  size   = var.size
  ssh_keys = var.ssh_keys
  vpc_uuid = var.vpc_uuid
  tags   = var.tags

  user_data = var.user_data

  monitoring = var.monitoring
  backups    = var.backups
  ipv6       = var.ipv6

  connection {
    type        = "ssh"
    user        = "root"
    private_key = file(var.private_key_path)
    host        = self.ipv4_address
  }

  # Optional: Add provisioners for initial setup
  provisioner "remote-exec" {
    inline = var.remote_exec_commands
  }
}

# Create a load balancer if enabled
resource "digitalocean_loadbalancer" "loadbalancer" {
  count  = var.enable_loadbalancer ? 1 : 0
  name   = "${var.name}-lb"
  region = var.region
  vpc_uuid = var.vpc_uuid

  forwarding_rule {
    entry_port     = var.lb_entry_port
    entry_protocol = var.lb_entry_protocol
    target_port     = var.lb_target_port
    target_protocol = var.lb_target_protocol
  }

  healthcheck {
    port     = var.lb_healthcheck_port
    protocol = var.lb_healthcheck_protocol
    path     = var.lb_healthcheck_path
  }

  redirect_http_to_https = var.lb_redirect_http_to_https
  enable_proxy_protocol  = var.lb_enable_proxy_protocol

  droplet_ids = digitalocean_droplet.droplet[*].id
} 