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

# Node configuration
BOOTSTRAP_NODE="<BOOTSTRAP_NODE_IP>"
SECONDARY_NODES=("<PEER_01_IP>" "<PEER_02_IP>")
SSH_USER="ipfs"
SSH_KEY="$HOME/.ssh/id_rsa"

# Function to generate a secure random string
generate_cluster_secret() {
    openssl rand -hex 32
}

# Function to check if running as ipfs user
check_user() {
    if [ "$USER" != "ipfs" ]; then
        print_error "Please run as ipfs user"
        exit 1
    fi
}

# Function to check required commands
check_requirements() {
    local missing=()
    
    for cmd in docker docker-compose jq openssl ssh scp; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_error "Missing required commands: ${missing[*]}"
        exit 1
    fi
}

# Function to check SSH connection
check_ssh() {
    local host=$1
    print_status "Checking SSH connection to $SSH_USER@$host..."
    
    if ! ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 $SSH_USER@$host echo "SSH connection successful" &> /dev/null; then
        print_error "Cannot connect to $SSH_USER@$host via SSH"
        return 1
    fi
    return 0
}

# Function to copy files to remote host
copy_files() {
    local host=$1
    print_status "Copying deployment files to $SSH_USER@$host..."
    
    # Create remote directory
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "mkdir -p /home/$SSH_USER/example-ipfs"
    
    # Copy files
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r ../docker-compose $SSH_USER@$host:/home/$SSH_USER/example-ipfs/
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ../scripts/setup-storage.sh $SSH_USER@$host:/home/$SSH_USER/example-ipfs/scripts/
    
    # Make scripts executable
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "chmod +x /home/$SSH_USER/example-ipfs/scripts/*.sh"
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "mkdir -p /home/$SSH_USER/koneksi-ipfs"
    
    # Copy files
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r ../docker-compose $SSH_USER@$host:/home/$SSH_USER/koneksi-ipfs/
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ../scripts/setup-storage.sh $SSH_USER@$host:/home/$SSH_USER/koneksi-ipfs/scripts/
    
    # Make scripts executable
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "chmod +x /home/$SSH_USER/koneksi-ipfs/scripts/*.sh"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
}

# Function to verify service health
verify_service_health() {
    local host=$1
    local service=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Verifying $service health on $host..."
    
    while [ $attempt -le $max_attempts ]; do
        if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "docker-compose ps $service | grep -q 'Up'"; then
            print_status "$service is healthy on $host!"
            return 0
        fi
        
        print_warning "Waiting for $service to be healthy on $host (attempt $attempt/$max_attempts)..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start properly on $host"
    return 1
}

# Function to verify cluster connectivity
verify_cluster_connectivity() {
    local host=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Verifying cluster connectivity on $host..."
    
    while [ $attempt -le $max_attempts ]; do
        if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "docker exec ipfs-cluster ipfs-cluster-ctl status | grep -q 'PEER'"; then
            print_status "Cluster connectivity verified on $host!"
            return 0
        fi
        
        print_warning "Waiting for cluster connectivity on $host (attempt $attempt/$max_attempts)..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Failed to verify cluster connectivity on $host"
    return 1
}

# Function to setup bootstrap node
setup_bootstrap() {
    local host=$BOOTSTRAP_NODE
    print_status "Setting up bootstrap node at $host..."
    
    # Check SSH connection
    check_ssh $host || exit 1
    
    # Copy files
    copy_files $host
    
    # Generate cluster secret
    local secret=$(generate_cluster_secret)
    
    # Create .env file
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cat > /home/$SSH_USER/example-ipfs/docker-compose/.env << EOL
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cat > /home/$SSH_USER/koneksi-ipfs/docker-compose/.env << EOL
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
# IPFS Cluster Configuration
CLUSTER_SECRET=$secret
CLUSTER_PEERNAME=bootstrap

# Node Configuration
NODE_TYPE=primary
PRIMARY_NODE_IP=$host

# Resource Limits
IPFS_MEMORY_LIMIT=32G
IPFS_CPU_LIMIT=8
CLUSTER_MEMORY_LIMIT=16G
CLUSTER_CPU_LIMIT=4

# Storage Paths
IPFS_PATH=/data/ipfs
IPFS_STORAGE_PATH=/data/ipfs-storage
CLUSTER_PATH=/data/ipfs-cluster

# Network Configuration
IPFS_SWARM_PORT=4001
IPFS_API_PORT=5001
IPFS_GATEWAY_PORT=8080
CLUSTER_API_PORT=9094
CLUSTER_PROXY_PORT=9095
EOL"
    
    # Setup storage
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "sudo /home/$SSH_USER/example-ipfs/scripts/setup-storage.sh"
    
    # Start services
    print_status "Starting IPFS and Cluster services..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cd /home/$SSH_USER/example-ipfs/docker-compose && docker-compose up -d"
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "sudo /home/$SSH_USER/koneksi-ipfs/scripts/setup-storage.sh"
    
    # Start services
    print_status "Starting IPFS and Cluster services..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cd /home/$SSH_USER/koneksi-ipfs/docker-compose && docker-compose up -d"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
    
    # Verify services
    verify_service_health $host "ipfs" || exit 1
    verify_service_health $host "ipfs-cluster" || exit 1
    
    # Get peer ID
    local peer_id=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "docker exec ipfs-cluster ipfs-cluster-ctl id | jq -r '.id'")
    if [ -z "$peer_id" ]; then
        print_error "Failed to get peer ID"
        exit 1
    fi
    
    # Add peer ID to .env
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "echo 'CLUSTER_PEER_ID=$peer_id' >> /home/$SSH_USER/example-ipfs/docker-compose/.env"
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "echo 'CLUSTER_PEER_ID=$peer_id' >> /home/$SSH_USER/koneksi-ipfs/docker-compose/.env"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
    
    print_status "Bootstrap node setup completed!"
    print_status "Cluster Secret: $secret"
    print_status "Peer ID: $peer_id"
    
    # Return cluster information
    echo "$secret"
    echo "$peer_id"
}

# Function to setup secondary node
setup_secondary() {
    local host=$1
    local node_number=$2
    local secret=$3
    local peer_id=$4
    
    print_status "Setting up secondary node $node_number at $host..."
    
    # Check SSH connection
    check_ssh $host || return 1
    
    # Copy files
    copy_files $host
    
    # Create .env file
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cat > /home/$SSH_USER/example-ipfs/docker-compose/.env << EOL
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cat > /home/$SSH_USER/koneksi-ipfs/docker-compose/.env << EOL
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
# IPFS Cluster Configuration
CLUSTER_SECRET=$secret
CLUSTER_PEERNAME=secondary-$node_number

# Node Configuration
NODE_TYPE=secondary
PRIMARY_NODE_IP=$BOOTSTRAP_NODE
CLUSTER_PEER_ID=$peer_id

# Resource Limits
IPFS_MEMORY_LIMIT=32G
IPFS_CPU_LIMIT=8
CLUSTER_MEMORY_LIMIT=16G
CLUSTER_CPU_LIMIT=4

# Storage Paths
IPFS_PATH=/data/ipfs
IPFS_STORAGE_PATH=/data/ipfs-storage
CLUSTER_PATH=/data/ipfs-cluster

# Network Configuration
IPFS_SWARM_PORT=4001
IPFS_API_PORT=5001
IPFS_GATEWAY_PORT=8080
CLUSTER_API_PORT=9094
CLUSTER_PROXY_PORT=9095
EOL"
    
    # Setup storage
<<<<<<< HEAD
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "sudo /home/$SSH_USER/example-ipfs/scripts/setup-storage.sh"
    
    # Start services
    print_status "Starting IPFS and Cluster services..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cd /home/$SSH_USER/example-ipfs/docker-compose && docker-compose up -d"
=======
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "sudo /home/$SSH_USER/koneksi-ipfs/scripts/setup-storage.sh"
    
    # Start services
    print_status "Starting IPFS and Cluster services..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$host "cd /home/$SSH_USER/koneksi-ipfs/docker-compose && docker-compose up -d"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
    
    # Verify services
    verify_service_health $host "ipfs" || return 1
    verify_service_health $host "ipfs-cluster" || return 1
    
    # Verify cluster connectivity
    verify_cluster_connectivity $host || return 1
    
    print_status "Secondary node $node_number setup completed!"
}

# Main deployment process
main() {
    print_status "Starting IPFS Cluster deployment..."
    
    check_user
    check_requirements
    
    # Check SSH key
    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key not found at $SSH_KEY"
        print_status "Please specify the path to your SSH key:"
        read -r custom_key
        if [ -f "$custom_key" ]; then
            SSH_KEY="$custom_key"
        else
            print_error "Invalid SSH key path"
            exit 1
        fi
    fi
    
    # Deploy bootstrap node first
    local cluster_info=($(setup_bootstrap))
    local secret=${cluster_info[0]}
    local peer_id=${cluster_info[1]}
    
    # Deploy secondary nodes
    for i in "${!SECONDARY_NODES[@]}"; do
        setup_secondary "${SECONDARY_NODES[$i]}" "$((i+1))" "$secret" "$peer_id"
    done
    
    print_status "All nodes deployed successfully!"
    print_status "You can verify the cluster status by running:"
    print_status "ssh -i $SSH_KEY $SSH_USER@$BOOTSTRAP_NODE 'docker exec ipfs-cluster ipfs-cluster-ctl status'"
}

# Run main function
main 