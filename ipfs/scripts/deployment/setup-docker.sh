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

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root"
        exit 1
    fi
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    # Update package index
    apt-get update
    
    # Install prerequisites
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    apt-get update
    
    # Install Docker Engine
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add ipfs user to docker group
    usermod -aG docker ipfs
    
    print_status "Docker installed successfully"
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    # Download Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    chmod +x /usr/local/bin/docker-compose
    
    # Create symbolic link
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_status "Docker Compose installed successfully"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check Docker
    if ! docker --version &> /dev/null; then
        print_error "Docker installation verification failed"
        return 1
    fi
    
    # Check Docker Compose
    if ! docker-compose --version &> /dev/null; then
        print_error "Docker Compose installation verification failed"
        return 1
    fi
    
    print_status "Installation verification completed successfully"
    return 0
}

# Main execution
main() {
    print_status "Starting Docker installation..."
    
    check_root
    install_docker
    install_docker_compose
    verify_installation
    
    print_status "Docker and Docker Compose installation completed successfully!"
    print_status "Next steps:"
    print_status "1. Log out and log back in for group changes to take effect"
    print_status "2. Verify Docker installation: docker --version"
    print_status "3. Verify Docker Compose installation: docker-compose --version"
}

# Run main function
main 