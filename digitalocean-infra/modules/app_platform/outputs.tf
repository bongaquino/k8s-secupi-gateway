output "app_id" {
  description = "The ID of the App Platform application"
  value       = digitalocean_app.app.id
}

output "app_url" {
  description = "The URL of the App Platform application"
  value       = digitalocean_app.app.live_url
}

output "app_spec" {
  description = "The specification of the App Platform application"
  value       = digitalocean_app.app.spec
  sensitive   = true
} 