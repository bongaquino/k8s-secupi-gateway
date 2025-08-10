#!/bin/bash

# Node IPs
BOOTSTRAP_NODE="<BOOTSTRAP_NODE_IP>"
PEER_01="<PEER_01_IP>"
PEER_02="<PEER_02_IP>"

# Check if required arguments are provided
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <username> <old_ip> <new_ip> <description>"
    echo "Example: $0 jb 169.150.218.66 112.198.104.175 'IP changed due to new ISP'"
    exit 1
fi

# Get arguments
USERNAME=$1
OLD_IP=$2
NEW_IP=$3
DESCRIPTION=$4

# Function to update IP on a node
update_node_ip() {
    local node_ip=$1
    echo "Updating $USERNAME's IP on $node_ip..."
    
    ssh ipfs@$node_ip << EOF
        # Remove old IP rule
        sudo ufw delete allow from $OLD_IP to any
        
        # Add new IP rule with description
        sudo ufw allow from $NEW_IP to any comment "$(echo $USERNAME | tr '[:lower:]' '[:upper:]') - $DESCRIPTION - $(date +%Y-%m-%d)"
        
        # Reload UFW
        sudo ufw reload
        
        # Show status
        sudo ufw status
EOF
}

# Update all nodes
echo "Updating $USERNAME's IP from $OLD_IP to $NEW_IP on all nodes..."
update_node_ip "$BOOTSTRAP_NODE"
update_node_ip "$PEER_01"
update_node_ip "$PEER_02"

echo "IP update completed!" 