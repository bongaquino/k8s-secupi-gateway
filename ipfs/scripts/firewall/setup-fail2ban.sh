#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Install fail2ban
print_status "Installing fail2ban..."
sudo apt-get update
sudo apt-get install -y fail2ban

# Create socket directory and set permissions
print_status "Setting up fail2ban socket directory..."
sudo mkdir -p /var/run/fail2ban
sudo chown -R root:root /var/run/fail2ban
sudo chmod 755 /var/run/fail2ban

# Create IPFS-specific jail configuration
print_status "Creating IPFS-specific jail configuration..."
sudo tee /etc/fail2ban/jail.d/ipfs.conf > /dev/null << EOL
[ipfs-ssh]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 300
bantime = 3600

[ipfs-api]
enabled = true
port = 5001
filter = ipfs-api
logpath = /data/ipfs/ipfs.log
maxretry = 5
findtime = 300
bantime = 3600

[ipfs-cluster-api]
enabled = true
port = 9094
filter = ipfs-cluster-api
logpath = /data/ipfs-cluster/cluster.log
maxretry = 5
findtime = 300
bantime = 3600
EOL

# Create custom filters
print_status "Creating custom filters..."
sudo tee /etc/fail2ban/filter.d/ipfs-api.conf > /dev/null << EOL
[Definition]
failregex = ^.*"POST /api/v0/add.*" 403 .*$
            ^.*"POST /api/v0/.*" 403 .*$
            ^.*"GET /api/v0/.*" 403 .*$
ignoreregex =
EOL

sudo tee /etc/fail2ban/filter.d/ipfs-cluster-api.conf > /dev/null << EOL
[Definition]
failregex = ^.*"POST /api/v0/.*" 403 .*$
            ^.*"GET /api/v0/.*" 403 .*$
ignoreregex =
EOL

# Create whitelist for trusted IPs
print_status "Creating whitelist for trusted IPs..."
sudo tee /etc/fail2ban/jail.d/whitelist.conf > /dev/null << EOL
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1
           211.239.117.217
           218.38.136.33
           218.38.136.34
EOL

# Add IPFS nodes to allowed list
211.239.117.217
218.38.136.33
218.38.136.34

# Restart fail2ban
print_status "Restarting fail2ban service..."
sudo systemctl stop fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Wait for service to fully start
sleep 5

# Verify installation
print_status "Verifying fail2ban status..."
sudo systemctl status fail2ban

# Show current jails
print_status "Current fail2ban jails:"
sudo fail2ban-client status

print_status "Fail2ban installation and configuration completed!"
print_status "You can monitor the logs with: sudo tail -f /var/log/fail2ban.log" 