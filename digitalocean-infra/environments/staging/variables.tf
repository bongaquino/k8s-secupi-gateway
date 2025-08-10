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

# Compute Module Variables
variable "droplet_image" {
  description = "The image ID or slug to use for the droplet"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "droplet_size" {
  description = "The unique slug that identifies the type of Droplet"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "droplet_count" {
  description = "Number of droplets to create"
  type        = number
  default     = 2
}

variable "ssh_keys" {
  description = "A list of SSH key IDs or fingerprints to enable"
  type        = list(string)
}

variable "vpc_uuid" {
  description = "The ID of the VPC where the Droplet will be located"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private key file for SSH access"
  type        = string
}
