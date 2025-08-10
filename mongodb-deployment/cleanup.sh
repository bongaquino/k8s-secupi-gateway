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

# Clean up Docker
print_status "Cleaning up Docker installation..."
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo apt-get remove -y docker docker-engine docker.io containerd runc || true"
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo apt-get autoremove -y"
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo rm -rf /var/lib/docker"
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo rm -rf /var/run/docker.sock"

# Clean up deployment directory
print_status "Cleaning up deployment directory..."
ssh ${SERVER_USER}@${SERVER_IP} "rm -rf ${REMOTE_DIR}/*"

print_status "Cleanup completed!" 