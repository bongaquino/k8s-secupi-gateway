# IPFS Cluster Scripts

This directory contains scripts for managing the IPFS cluster deployment, maintenance, and monitoring.

## Directory Structure

### Firewall Scripts (`firewall/`)
- `update-user-ip.sh`: Updates user IP whitelist across all nodes with proper documentation
- `setup-fail2ban.sh`: Configures fail2ban for enhanced security

### Storage Scripts (`storage/`)
- `setup-storage.sh`: Sets up and configures storage for IPFS nodes
- `check-raid-status.sh`: Monitors RAID array status
- `verify-storage.sh`: Verifies storage configuration and health

### Network Scripts (`network/`)
- `network-test.sh`: Tests network connectivity between nodes
- `test-endpoints.sh`: Tests IPFS and IPFS Cluster API endpoints

### Deployment Scripts (`deployment/`)
- `deploy.sh`: Main deployment script for the IPFS cluster
- `setup-docker.sh`: Sets up Docker environment
- `copy-configs.sh`: Copies configuration files to nodes
- `update-nodes.sh`: Updates node configurations

## Usage

### Updating User IP
```bash
./firewall/update-user-ip.sh <username> <old_ip> <new_ip> <description>
# Example:
./firewall/update-user-ip.sh jb 169.150.218.66 112.198.104.175 "IP changed due to new ISP"
```

### Checking Storage Status
```bash
./storage/check-raid-status.sh
```

### Testing Network Connectivity
```bash
./network/network-test.sh
```

### Deploying Updates
```bash
./deployment/deploy.sh
```

## Best Practices
1. Always backup configurations before making changes
2. Test scripts in a staging environment first
3. Document any manual changes made to the system
4. Keep scripts up to date with the latest security practices 