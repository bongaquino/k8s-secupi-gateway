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

# Server details
SERVER_IP="192.168.14.17"
SERVER_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/mongodb-deployment"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    print_warning "SSH key not found. You will be prompted for password."
fi

# Create remote directory
print_status "Creating remote directory..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_DIR}"

# Copy files to remote server
print_status "Copying deployment files to remote server..."
scp -r ./* ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

# Make scripts executable on remote server
print_status "Setting up permissions on remote server..."
ssh ${SERVER_USER}@${SERVER_IP} "chmod +x ${REMOTE_DIR}/*.sh"

# First, run the server setup script
print_status "Setting up server prerequisites..."
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo ${REMOTE_DIR}/setup-server.sh"

print_status "Server setup completed. Please log out and log back in to the server for group changes to take effect."
print_status "After logging back in, run the deployment script again to complete the MongoDB deployment."
print_status "You can do this by running: ./remote-deploy.sh" 