# ARData DigitalOcean Infrastructure

This repository contains the Infrastructure as Code (IaC) for managing Ardata's DigitalOcean infrastructure using Terraform.

## Repository Structure

```
ardata-do-infra/
├── environments/         # Environment-specific configurations
│   ├── staging/          # Staging environment
│   ├── uat/              # User Acceptance Testing environment
│   └── prod/             # Production environment
│
├── modules/              # Reusable Terraform modules
│   ├── app_platform/     # DigitalOcean App Platform configurations
│   ├── compute/          # Compute resources (Droplets, etc.)
│   ├── database/         # Database configurations
│   ├── monitoring/       # Monitoring and alerting setup
│   ├── networking/       # VPC, Load Balancers, etc.
│   ├── security/         # Security groups, firewalls, etc.
│   └── ssh_keys/         # SSH key management
│
├── main.tf               # Main Terraform configuration
├── variables.tf          # Input variables
├── outputs.tf            # Output values
├── versions.tf           # Terraform and provider versions
└── .gitignore            # Git ignore file
```

## Prerequisites

- Terraform >= 1.0.0
- DigitalOcean account and API token
- Git

## Getting Started

1. Clone this repository
2. Configure your DigitalOcean API token
3. Navigate to the desired environment directory
4. Initialize Terraform:
   ```bash
   terraform init
   ```
5. Plan your changes:
   ```bash
   terraform plan
   ```
6. Apply the configuration:
   ```bash
   terraform apply
   ```

## Environment Management

Each environment (staging, UAT, prod) has its own configuration and state file. Always ensure you're in the correct environment directory before running Terraform commands.

## Contributing

1. Create a new branch for your changes
2. Make your changes
3. Submit a pull request
4. Ensure all Terraform plans are reviewed before merging

## Security

- Never commit sensitive information or credentials
- Use environment variables or secure secret management for sensitive data
- Follow the principle of least privilege when configuring access
