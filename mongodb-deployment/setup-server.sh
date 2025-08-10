#!/bin/bash

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Clean up any existing Docker installation
print_status "Cleaning up any existing Docker installation..."
apt-get remove -y docker docker-engine docker.io containerd runc || true
apt-get autoremove -y
rm -rf /var/lib/docker
rm -rf /var/run/docker.sock

# Update system
print_status "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Add Docker's official GPG key
print_status "Adding Docker's official GPG key..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
print_status "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
print_status "Installing Docker..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configure Docker daemon
print_status "Configuring Docker daemon..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Start and enable Docker
print_status "Starting Docker service..."
systemctl daemon-reload
systemctl stop docker || true
systemctl start docker
systemctl enable docker

# Verify Docker installation
print_status "Verifying Docker installation..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker installation failed. Checking logs..."
    journalctl -u docker.service -n 50
    exit 1
fi

# Add ubuntu user to docker group
print_status "Adding ubuntu user to docker group..."
usermod -aG docker ubuntu

# Create necessary directories
print_status "Creating required directories..."
mkdir -p /var/log/mongodb
chown -R ubuntu:ubuntu /var/log/mongodb
chmod 755 /var/log/mongodb

# Set up MongoDB directory
print_status "Setting up MongoDB directory..."
mkdir -p /data/db
chown -R ubuntu:ubuntu /data/db
chmod 755 /data/db

# Install MongoDB shell for testing
print_status "Installing MongoDB shell..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-mongosh

print_status "Server setup completed!"
print_status "Please log out and log back in for group changes to take effect."
print_status "After logging back in, you can run the deployment script as the ubuntu user." 