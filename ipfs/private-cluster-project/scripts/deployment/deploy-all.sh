#!/bin/bash

# Deployment script for IPFS Private Cluster Project
# Deploys HAProxy load balancer + 3 IPFS cluster nodes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_PROJECT_NAME="private-cluster-project"

print_status "IPFS Private Cluster Deployment Starting..."
print_status "Project root: $PROJECT_ROOT"
print_status "Compose project: $COMPOSE_PROJECT_NAME"

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if running as root for data directory creation
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root - will create data directories"
    else
        print_warning "Not running as root - ensure data directories exist"
    fi
    
    print_status "Prerequisites check passed"
}

# Function to create data directories
create_data_directories() {
    print_header "Creating Data Directories"
    
    sudo mkdir -p /data/{ipfs-private-01,ipfs-private-02,ipfs-private-03}
    sudo mkdir -p /data/{ipfs-cluster-private-01,ipfs-cluster-private-02,ipfs-cluster-private-03}
    
    # Set permissions
    sudo chown -R $USER:$USER /data/ipfs-private-*
    sudo chown -R $USER:$USER /data/ipfs-cluster-private-*
    
    print_status "Data directories created"
}

# Function to create networks
create_networks() {
    print_header "Creating Docker Networks"
    
    cd "$PROJECT_ROOT/docker-compose/haproxy-public"
    
    # Create networks from HAProxy compose file
    docker-compose up --no-start
    
    print_status "Docker networks created"
}

# Function to start HAProxy load balancer
start_haproxy() {
    print_header "Starting HAProxy Load Balancer"
    
    cd "$PROJECT_ROOT/docker-compose/haproxy-public"
    
    # Create required directories
    mkdir -p ssl logs certbot-www
    
    # Start HAProxy services
    docker-compose up -d
    
    print_status "HAProxy load balancer started"
}

# Function to start IPFS cluster nodes
start_cluster_nodes() {
    print_header "Starting IPFS Cluster Nodes"
    
    # Start bootstrap node first
    print_status "Starting bootstrap node (private-01)..."
    cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-01"
    docker-compose up -d
    
    # Wait for bootstrap to be ready
    print_status "Waiting for bootstrap node to be ready..."
    sleep 30
    
    # Get bootstrap peer ID
    BOOTSTRAP_PEER_ID=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl id | jq -r '.id')
    print_status "Bootstrap peer ID: $BOOTSTRAP_PEER_ID"
    
    # Update peer configurations with bootstrap peer ID
    update_peer_configs "$BOOTSTRAP_PEER_ID"
    
    # Start peer nodes
    print_status "Starting peer node 02..."
    cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-02"
    docker-compose up -d
    
    print_status "Starting peer node 03..."
    cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-03"
    docker-compose up -d
    
    print_status "All cluster nodes started"
}

# Function to update peer configurations
update_peer_configs() {
    local bootstrap_id="$1"
    
    print_status "Updating peer configurations with bootstrap ID: $bootstrap_id"
    
    # Update private-02
    sed -i.bak "s/BOOTSTRAP_PEER_ID_PLACEHOLDER/$bootstrap_id/g" \
        "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-02/service.json"
    
    # Update private-03
    sed -i.bak "s/BOOTSTRAP_PEER_ID_PLACEHOLDER/$bootstrap_id/g" \
        "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-03/service.json"
    
    print_status "Peer configurations updated"
}

# Function to verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check HAProxy
    if curl -s http://localhost:8404/stats > /dev/null; then
        print_status "✓ HAProxy stats accessible"
    else
        print_warning "✗ HAProxy stats not accessible"
    fi
    
    # Check cluster nodes
    for i in {1..3}; do
        container="ipfs-cluster-private-0$i"
        if docker exec "$container" ipfs-cluster-ctl id > /dev/null 2>&1; then
            print_status "✓ $container is running"
        else
            print_warning "✗ $container is not responding"
        fi
    done
    
    # Check cluster connectivity
    print_status "Checking cluster connectivity..."
    sleep 10
    
    peers=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls | wc -l)
    if [ "$peers" -eq 3 ]; then
        print_status "✓ All 3 peers connected"
    else
        print_warning "✗ Only $peers peers connected (expected 3)"
    fi
}

# Function to show deployment information
show_deployment_info() {
    print_header "Deployment Information"
    
    echo ""
    print_status "🎯 Access Points:"
    print_status "   HAProxy Stats: http://localhost:8404/stats"
    print_status "   IPFS API: http://localhost/api/v0/"
    print_status "   IPFS Gateway: http://localhost/ipfs/"
    print_status "   Cluster API: http://localhost/cluster/"
    
    echo ""
    print_status "🔗 Internal Addresses:"
    print_status "   Bootstrap Node: 172.21.0.10"
    print_status "   Peer Node 02: 172.21.0.11"  
    print_status "   Peer Node 03: 172.21.0.12"
    
    echo ""
    print_status "📊 Management Commands:"
    print_status "   Check cluster: docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls"
    print_status "   Add content: docker exec ipfs-cluster-private-01 ipfs-cluster-ctl add /path/to/file"
    print_status "   View logs: docker-compose logs -f (in each directory)"
    
    echo ""
    print_status "🛑 Stop Commands:"
    print_status "   Stop all: $PROJECT_ROOT/scripts/deployment/stop-all.sh"
    print_status "   Cleanup: $PROJECT_ROOT/scripts/deployment/cleanup.sh"
}

# Main deployment function
main() {
    print_status "🚀 Starting IPFS Private Cluster Deployment"
    echo ""
    
    check_prerequisites
    create_data_directories
    create_networks
    start_haproxy
    start_cluster_nodes
    verify_deployment
    show_deployment_info
    
    echo ""
    print_status "✅ Deployment completed successfully!"
}

# Trap errors
trap 'print_error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@" 