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

# Add ubuntu user to sudoers
print_status "Adding ubuntu user to sudoers..."
ssh -t ${SERVER_USER}@${SERVER_IP} "echo '${SERVER_USER} ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/${SERVER_USER}"

# Set proper permissions
print_status "Setting proper permissions..."
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo chmod 440 /etc/sudoers.d/${SERVER_USER}"

print_status "Ubuntu user has been added to sudoers!"
print_status "You can now run sudo commands without password prompt." 