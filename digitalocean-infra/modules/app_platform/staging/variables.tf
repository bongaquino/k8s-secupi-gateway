variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
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

variable "app_repository" {
  description = "Docker repository for the main application"
  type        = string
}

variable "app_tag" {
  description = "Docker image tag for the main application"
  type        = string
  default     = "latest"
}

variable "worker_repository" {
  description = "Docker repository for the worker service"
  type        = string
}

variable "worker_tag" {
  description = "Docker image tag for the worker service"
  type        = string
  default     = "latest"
}

variable "api_image_repository" {
  description = "Docker image repository for the API service"
  type        = string
}

variable "api_image_tag" {
  description = "Docker image tag for the API service"
  type        = string
}

variable "database_url" {
  description = "Database URL for the application"
  type        = string
}

variable "redis_url" {
  description = "Redis URL for the application"
  type        = string
}

variable "worker_instance_count" {
  description = "Number of instances for the worker service"
  type        = number
  default     = 1
}

variable "worker_instance_size" {
  description = "Instance size for the worker service"
  type        = string
  default     = "basic-xxs"
}

variable "worker_image_repository" {
  description = "Docker image repository for the worker service"
  type        = string
}

variable "worker_image_tag" {
  description = "Docker image tag for the worker service"
  type        = string
} 