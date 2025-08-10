variable "instance_count" {
  description = "Number of droplets to create"
  type        = number
  default     = 1
}

variable "image" {
  description = "The image ID or slug to use for the droplet"
  type        = string
}

variable "name" {
  description = "The name of the droplet"
  type        = string
}

variable "region" {
  description = "The region to start in"
  type        = string
  default     = "nyc1"
}

variable "size" {
  description = "The unique slug that identifies the type of Droplet"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "ssh_keys" {
  description = "A list of SSH key IDs or fingerprints to enable in the format [12345, 123456]"
  type        = list(string)
  default     = []
}

variable "vpc_uuid" {
  description = "The ID of the VPC where the Droplet will be located"
  type        = string
}

variable "tags" {
  description = "A list of the tags to be applied to this Droplet"
  type        = list(string)
  default     = []
}

variable "user_data" {
  description = "A string of the desired User Data for the Droplet"
  type        = string
  default     = ""
}

variable "monitoring" {
  description = "Boolean controlling whether monitoring agent is installed"
  type        = bool
  default     = true
}

variable "backups" {
  description = "Boolean controlling whether backups are made"
  type        = bool
  default     = false
}

variable "ipv6" {
  description = "Boolean controlling whether IPv6 is enabled"
  type        = bool
  default     = true
}

variable "private_key_path" {
  description = "Path to the private key file for SSH access"
  type        = string
}

variable "remote_exec_commands" {
  description = "List of commands to execute on the droplet after creation"
  type        = list(string)
  default     = []
}

# Load Balancer Variables
variable "enable_loadbalancer" {
  description = "Whether to create a load balancer"
  type        = bool
  default     = false
}

variable "lb_entry_port" {
  description = "The port on which the load balancer instance will listen"
  type        = number
  default     = 80
}

variable "lb_entry_protocol" {
  description = "The protocol used for traffic to the load balancer"
  type        = string
  default     = "http"
}

variable "lb_target_port" {
  description = "The port on the target droplets to which the load balancer will send traffic"
  type        = number
  default     = 80
}

variable "lb_target_protocol" {
  description = "The protocol used for traffic from the load balancer to the target droplets"
  type        = string
  default     = "http"
}

variable "lb_healthcheck_port" {
  description = "The port on which the health check will attempt to connect"
  type        = number
  default     = 80
}

variable "lb_healthcheck_protocol" {
  description = "The protocol used for health checks"
  type        = string
  default     = "http"
}

variable "lb_healthcheck_path" {
  description = "The path on the target droplets to which the health check will send requests"
  type        = string
  default     = "/"
}

variable "lb_redirect_http_to_https" {
  description = "Whether to redirect HTTP traffic to HTTPS"
  type        = bool
  default     = false
}

variable "lb_enable_proxy_protocol" {
  description = "Whether to enable proxy protocol"
  type        = bool
  default     = false
} 