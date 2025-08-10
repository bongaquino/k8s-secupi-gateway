variable "app_name" {
  description = "Name of the App Platform application"
  type        = string
}

variable "region" {
  description = "DigitalOcean region where the app will be deployed"
  type        = string
  default     = "nyc1"
}

variable "environment" {
  description = "Environment name (e.g., staging, production)"
  type        = string
}

variable "api_instance_count" {
  description = "Number of instances for the API service"
  type        = number
  default     = 1
}

variable "api_instance_size" {
  description = "Instance size for the API service"
  type        = string
  default     = "basic-xxs"
} 