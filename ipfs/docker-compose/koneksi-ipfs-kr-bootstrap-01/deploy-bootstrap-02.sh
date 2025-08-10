#!/bin/bash

# Deployment script for IPFS Bootstrap Node 02
# Server: 27.255.70.17
# User: ipfs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Server configuration
SERVER_IP="27.255.70.17"
USERNAME="ipfs"
PASSWORD="!Z2x3c*()"

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to execute commands on remote server
remote_exec() {
    local cmd="$1"
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" "$cmd"
}

# Function to copy files to remote server
remote_copy() {
    local local_path="$1"
    local remote_path="$2"
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -r "$local_path" "$USERNAME@$SERVER_IP:$remote_path"
}

# Function to check if sshpass is available
check_sshpass() {
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is required but not installed. Please install it:"
        print_status "Ubuntu/Debian: sudo apt install sshpass"
        print_status "macOS: brew install hudochenkov/sshpass/sshpass"
        exit 1
    fi
}

# Function to test connection
test_connection() {
    print_status "Testing connection to $USERNAME@$SERVER_IP..."
    if remote_exec "echo 'Connection successful'"; then
        print_status "Connection successful!"
    else
        print_error "Failed to connect to server"
        exit 1
    fi
}

# Function to prepare server
prepare_server() {
    print_status "Preparing server..."
    
    # Update system
    print_status "Updating system packages..."
    remote_exec "sudo apt update && sudo apt upgrade -y"
    
    # Install required packages
    print_status "Installing required packages..."
    remote_exec "sudo apt install -y docker.io docker-compose curl wget git ufw fail2ban"
    
    # Add user to docker and sudo groups
    print_status "Adding user to docker and sudo groups..."
    remote_exec "sudo usermod -aG docker,sudo $USERNAME"
    
    # Create directories
    print_status "Creating directory structure..."
    remote_exec "sudo mkdir -p /data/ipfs /data/ipfs-cluster"
    remote_exec "sudo chown -R $USERNAME:$USERNAME /data/ipfs /data/ipfs-cluster"
<<<<<<< HEAD
    remote_exec "mkdir -p /home/$USERNAME/bongaquino-ipfs/docker-compose"
=======
    remote_exec "mkdir -p /home/$USERNAME/koneksi-ipfs/docker-compose"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
}

# Function to configure security
configure_security() {
    print_status "Configuring security..."
    
    # Configure UFW
    print_status "Setting up firewall rules..."
    remote_exec "sudo ufw --force reset"
    remote_exec "sudo ufw allow 22/tcp"
    remote_exec "sudo ufw allow 80/tcp"
    remote_exec "sudo ufw allow 443/tcp"
    
    # Cluster communication ports will be configured when peer nodes are added
    # For now, only allow essential access
    
    # Allow backend server
    remote_exec "sudo ufw allow from 52.77.36.120 to any"
    
    # Set default policies and enable
    remote_exec "sudo ufw default deny incoming"
    remote_exec "sudo ufw default allow outgoing"
    remote_exec "sudo ufw --force enable"
    
    print_status "Firewall configured successfully"
}

# Function to deploy configuration
deploy_configuration() {
    print_status "Deploying IPFS configuration..."
    
    # Copy configuration files
    print_status "Copying configuration files..."
<<<<<<< HEAD
    remote_copy "." "/home/$USERNAME/bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02"
    
    # Make scripts executable
    print_status "Making scripts executable..."
    remote_exec "cd /home/$USERNAME/bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02 && chmod +x *.sh"
    
    # Start services
    print_status "Starting IPFS services..."
    remote_exec "cd /home/$USERNAME/bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02 && sg docker -c 'docker-compose up -d'"
=======
    remote_copy "." "/home/$USERNAME/koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02"
    
    # Make scripts executable
    print_status "Making scripts executable..."
    remote_exec "cd /home/$USERNAME/koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02 && chmod +x *.sh"
    
    # Start services
    print_status "Starting IPFS services..."
    remote_exec "cd /home/$USERNAME/koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02 && sg docker -c 'docker-compose up -d'"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 30
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check service status
    print_status "Checking service status..."
<<<<<<< HEAD
    remote_exec "cd /home/$USERNAME/bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02 && sg docker -c 'docker-compose ps'"
=======
    remote_exec "cd /home/$USERNAME/koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02 && sg docker -c 'docker-compose ps'"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
    
    # Check IPFS status
    print_status "Checking IPFS status..."
    remote_exec "sg docker -c 'docker exec ipfs ipfs id'" || print_warning "IPFS not ready yet"
    
    # Check IPFS Cluster status
    print_status "Checking IPFS Cluster status..."
    remote_exec "sg docker -c 'docker exec ipfs-cluster ipfs-cluster-ctl id'" || print_warning "IPFS Cluster not ready yet"
    
    print_status "Deployment verification complete!"
}

# Function to show post-deployment information
show_info() {
    print_status "Bootstrap Node 02 Deployment Complete!"
    echo ""
    print_status "Server Information:"
    print_status "  IP Address: $SERVER_IP"
    print_status "  Username: $USERNAME"
    print_status "  Peername: kr-bootstrap-02"
    echo ""
    print_status "Access URLs:"
    print_status "  IPFS API: http://$SERVER_IP:5001"
    print_status "  IPFS Gateway: http://$SERVER_IP:8080"
    print_status "  Cluster API: http://$SERVER_IP:9094"
    echo ""
    print_status "Next Steps:"
    print_status "1. Verify bootstrap node is running independently"
    print_status "2. Deploy new peer nodes for this cluster"
    print_status "3. Configure firewall rules for new peer connections"
    print_status "4. Test cluster functionality with new peers"
    echo ""
    print_status "Useful Commands:"
    print_status "  SSH: ssh $USERNAME@$SERVER_IP"
    print_status "  Check services: docker-compose ps (or docker ps)"
    print_status "  Check logs: docker-compose logs -f"
    print_status "  Check cluster: docker exec ipfs-cluster ipfs-cluster-ctl peers ls"
    print_status ""
    print_status "Note: Docker commands should work without sudo after logging back in."
    print_status "If needed, logout and login again or run: newgrp docker"
}

# Main deployment function
main() {
    print_status "Starting Bootstrap Node 02 deployment..."
    print_status "Target server: $USERNAME@$SERVER_IP"
    echo ""
    
    check_sshpass
    test_connection
    prepare_server
    configure_security
    deploy_configuration
    verify_deployment
    show_info
    
    print_status "Deployment completed successfully!"
}

# Run main function
main 