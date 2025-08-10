#!/bin/bash

# Define server configurations
servers=(
<<<<<<< HEAD
    "211.239.117.217:bongaquino-ipfs-kr-bootstrap-01"
    "218.38.136.33:bongaquino-ipfs-kr-peer-01"
    "218.38.136.34:bongaquino-ipfs-kr-peer-02"
=======
    "211.239.117.217:koneksi-ipfs-kr-bootstrap-01"
    "218.38.136.33:koneksi-ipfs-kr-peer-01"
    "218.38.136.34:koneksi-ipfs-kr-peer-02"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
)

# Base directory for the configurations
BASE_DIR="docker-compose"

# Function to copy configuration to a server
copy_to_server() {
    local server=$1
    local config_dir=$2
<<<<<<< HEAD
    local remote_dir="/home/ipfs/bongaquino-ipfs/$BASE_DIR/$config_dir"
=======
    local remote_dir="/home/ipfs/koneksi-ipfs/$BASE_DIR/$config_dir"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

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