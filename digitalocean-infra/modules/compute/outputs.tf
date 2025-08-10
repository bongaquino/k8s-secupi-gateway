output "droplet_ids" {
  description = "List of IDs of the created droplets"
  value       = digitalocean_droplet.droplet[*].id
}

output "droplet_ips" {
  description = "List of IPv4 addresses of the created droplets"
  value       = digitalocean_droplet.droplet[*].ipv4_address
}

output "droplet_private_ips" {
  description = "List of private IPv4 addresses of the created droplets"
  value       = digitalocean_droplet.droplet[*].ipv4_address_private
}

output "loadbalancer_id" {
  description = "ID of the created load balancer (if enabled)"
  value       = var.enable_loadbalancer ? digitalocean_loadbalancer.loadbalancer[0].id : null
}

output "loadbalancer_ip" {
  description = "IP address of the created load balancer (if enabled)"
  value       = var.enable_loadbalancer ? digitalocean_loadbalancer.loadbalancer[0].ip : null
}

output "loadbalancer_status" {
  description = "Status of the created load balancer (if enabled)"
  value       = var.enable_loadbalancer ? digitalocean_loadbalancer.loadbalancer[0].status : null
} 