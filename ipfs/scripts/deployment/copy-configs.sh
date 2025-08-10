#!/bin/bash

# Define server configurations
servers=(
    "211.239.117.217:koneksi-ipfs-kr-bootstrap-01"
    "218.38.136.33:koneksi-ipfs-kr-peer-01"
    "218.38.136.34:koneksi-ipfs-kr-peer-02"
)

# Base directory for the configurations
BASE_DIR="docker-compose"

# Function to copy configuration to a server
copy_to_server() {
    local server=$1
    local config_dir=$2
    local remote_dir="/home/ipfs/koneksi-ipfs/$BASE_DIR/$config_dir"

    echo "Copying $config_dir configuration to $server..."
    
    # Create remote directory structure
    ssh ipfs@$server "mkdir -p $remote_dir"
    
    # Copy all files and directories
    scp -r $BASE_DIR/$config_dir/* ipfs@$server:$remote_dir/
    
    # Make init-letsencrypt.sh executable if it exists
    ssh ipfs@$server "chmod +x $remote_dir/init-letsencrypt.sh 2>/dev/null || true"
    
    echo "Configuration copied to $server"
    echo "----------------------------------------"
}

# Main execution
echo "Starting configuration deployment..."
echo "----------------------------------------"

# Copy configurations to each server
for server_config in "${servers[@]}"; do
    IFS=':' read -r server config_dir <<< "$server_config"
    copy_to_server $server $config_dir
done

echo "Configuration deployment completed!" 