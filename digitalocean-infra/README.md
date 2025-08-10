# 🌊 Bong Aquino DigitalOcean Infrastructure

> **Scalable cloud infrastructure on DigitalOcean using Infrastructure as Code with Terraform for modern application deployment.**

[![Terraform](https://img.shields.io/badge/Terraform-v1.0+-7B42BC?logo=terraform)](https://terraform.io)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Cloud-0080FF?logo=digitalocean)](https://digitalocean.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Overview

Professional-grade Infrastructure as Code (IaC) for managing DigitalOcean resources with Terraform. Designed for scalability, maintainability, and cost-effectiveness.

## 🚀 Quick Start

### Prerequisites
- [Terraform](https://terraform.io/downloads) >= 1.0
- [DigitalOcean CLI](https://docs.digitalocean.com/reference/doctl/) (optional)
- DigitalOcean API token

### Setup & Deploy
```bash
# Clone repository
git clone https://github.com/bongaquino/digitalocean-infra.git
cd digitalocean-infra

# Configure DigitalOcean token
export DIGITALOCEAN_TOKEN="your-do-token"

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

## 🏗️ Infrastructure Components

### Core Resources
| Component | Purpose | Environment |
|-----------|---------|-------------|
| **🏗️ App Platform** | Application hosting | Staging, UAT, Prod |
| **💻 Droplets** | Compute instances | Multi-environment |
| **🌐 Load Balancers** | Traffic distribution | Production ready |
| **💾 Databases** | Managed databases | High availability |
| **📡 Networking** | VPC and firewall | Secure by default |
| **📊 Monitoring** | Performance tracking | Built-in alerts |

## 📁 Project Structure

```
digitalocean-infra/
├── 🌍 environments/           # Environment-specific configs
│   ├── staging/              # Development staging
│   ├── uat/                  # User acceptance testing  
│   └── prod/                 # Production environment
├── 🧩 modules/               # Reusable Terraform modules
│   ├── app_platform/         # DigitalOcean Apps
│   ├── compute/              # Droplet management
│   ├── database/             # Database clusters
│   ├── monitoring/           # Alerting & metrics
│   ├── networking/           # VPC & security
│   └── security/             # Firewall rules
├── 🎯 main.tf                # Root configuration
├── 📋 variables.tf           # Input variables
└── 📤 outputs.tf             # Output values
```

## 🌍 Environment Management

### Available Environments
- **🧪 Staging** - Development and testing
- **🔍 UAT** - User acceptance testing
- **🏭 Production** - Live applications

### Deploy to Specific Environment
```bash
# Navigate to environment
cd environments/staging

# Deploy staging resources
terraform init
terraform apply

# Check outputs
terraform output
```

## 🚀 App Platform Deployment

### Staging App Configuration
```hcl
# Deploy Node.js application
resource "digitalocean_app" "bongaquino_staging" {
  spec {
    name   = "bongaquino-staging-app"
    region = "nyc1"
    
    service {
      name         = "web"
      source_dir   = "/"
      github {
        repo   = "bongaquino/bongaquino-staging-app"
        branch = "main"
      }
      
      environment_slug = "node-js"
      instance_count   = 1
      instance_size    = "basic-xxs"
      
      http_port = 8080
      
      health_check {
        http_path = "/health"
      }
    }
  }
}
```

## 🔧 Configuration

### Required Variables
```hcl
# DigitalOcean settings
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

# Project settings
variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "bongaquino"
}

variable "environment" {
  description = "Environment name"
  type        = string
}
```

### Environment Configuration
```bash
# Set via environment variables
export TF_VAR_do_token="your-digitalocean-token"
export TF_VAR_environment="staging"

# Or create terraform.tfvars
echo 'do_token = "your-token"' > terraform.tfvars
echo 'environment = "staging"' >> terraform.tfvars
```

## 🌐 Networking & Security

### VPC Configuration
- **🔒 Private networking** by default
- **🛡️ Firewall rules** for each environment
- **🔐 SSH key management** with rotation
- **📡 Load balancer** SSL termination

### Security Best Practices
```hcl
# Firewall rules example
resource "digitalocean_firewall" "web" {
  name = "${var.project_name}-${var.environment}-web"

  droplet_ids = [digitalocean_droplet.web.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]  # Allow all (configure as needed)
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]  # Allow all (configure as needed)
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["your-office-ip/32"]
  }
}
```

## 📊 Monitoring & Alerts

### Built-in Monitoring
- **📈 Resource utilization** tracking
- **🚨 Automated alerting** for critical metrics
- **📧 Email notifications** for incidents
- **📊 Performance dashboards** via DigitalOcean

### Custom Alerts
```hcl
resource "digitalocean_monitor_alert" "cpu_alert" {
  alerts {
    email = ["admin@example.com"]
  }
  
  window      = "5m"
  type        = "v1/insights/droplet/cpu"
  compare     = "greater_than"
  value       = 80
  enabled     = true
  entities    = [digitalocean_droplet.web.id]
  description = "High CPU usage alert"
}
```

## 💰 Cost Optimization

### Resource Sizing
| Service | Size | Monthly Cost | Use Case |
|---------|------|--------------|----------|
| **Basic XXS** | 512MB/1vCPU | $5/month | Development |
| **Basic XS** | 1GB/1vCPU | $10/month | Staging |
| **Basic S** | 2GB/2vCPU | $20/month | Production |

### Cost Management
- **🔄 Auto-scaling** based on traffic
- **⏰ Scheduled scaling** for predictable loads
- **📊 Cost monitoring** with budget alerts
- **🗑️ Automated cleanup** of unused resources

## 🚀 CI/CD Integration

### GitHub Actions Deployment
```yaml
name: Deploy to DigitalOcean
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        
      - name: Deploy Infrastructure
        env:
          DIGITALOCEAN_TOKEN: ${{ secrets.DO_TOKEN }}
        run: |
          terraform init
          terraform apply -auto-approve
```

## 🛠️ Management Commands

### Useful Terraform Commands
```bash
# View current state
terraform show

# List all resources
terraform state list

# Import existing resources
terraform import digitalocean_droplet.example 123456

# Destroy specific resource
terraform destroy -target=digitalocean_droplet.example

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate
```

### DigitalOcean CLI Commands
```bash
# List droplets
doctl compute droplet list

# Check app status
doctl apps list

# View firewall rules
doctl compute firewall list

# Monitor resource usage
doctl monitoring metrics droplet
```

## 🤝 Contributing

### Development Workflow
1. **🍴 Fork** the repository
2. **🌿 Create** feature branch
3. **💻 Develop** with proper naming
4. **✅ Test** with `terraform plan`
5. **📝 Document** any changes
6. **🚀 Submit** pull request

### Module Standards
- **📝 Documentation** required
- **🧪 Testing** with Terratest
- **🔒 Security** scanning
- **💰 Cost** impact analysis

## 📞 Support & Resources

- **📖 DigitalOcean Docs**: [Official Documentation](https://docs.digitalocean.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/bongaquino/digitalocean-infra/issues)
- **💬 Community**: [DigitalOcean Community](https://www.digitalocean.com/community)
- **📧 Contact**: admin@example.com

---

<div align="center">

**Powered by [DigitalOcean](https://digitalocean.com) • Built with ❤️ by [Bong Aquino](https://github.com/bongaquino)**

*Cloud Infrastructure | Simple • Scalable • Secure*

</div>