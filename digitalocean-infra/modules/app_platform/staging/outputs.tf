output "app_id" {
  description = "The ID of the App Platform application"
  value       = module.app_platform.app_id
}

output "app_url" {
  description = "The URL of the App Platform application"
  value       = module.app_platform.app_url
}

output "app_spec" {
  description = "The specification of the App Platform application"
  value       = module.app_platform.app_spec
  sensitive   = true
} 