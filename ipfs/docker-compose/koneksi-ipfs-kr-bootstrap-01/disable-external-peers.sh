#!/bin/bash

# Disable public network discovery
docker exec ipfs ipfs config --json Discovery.MDNS.Enabled false
docker exec ipfs ipfs config --json Pubsub.Enabled false

# Configure peering to only allow future cluster peers (empty for now as this is the first node)
# When new peer nodes are added, they will be configured here
docker exec ipfs ipfs config --json Peering.Peers '[]'

# Disable public gateway
docker exec ipfs ipfs config --json Gateway.PublicGateways '{}'

# Restart IPFS to apply changes
docker restart ipfs

echo "External peer connections have been disabled. This is a new isolated cluster."
echo "Future peer nodes will be added to the Peering.Peers configuration." 