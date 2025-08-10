resource "digitalocean_app" "app" {
  spec {
    name   = var.app_name
    region = var.region

    service {
      name               = "api"
      instance_count     = var.api_instance_count
      instance_size_slug = var.api_instance_size

      github {
        repo           = "bongaquino/${var.app_name}"
        branch         = "main"
        deploy_on_push = true
      }

      env {
        key   = "NODE_ENV"
        value = var.environment
      }

      routes {
        path = "/"
      }
    }
  }
} 