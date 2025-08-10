#!/bin/sh
set -e

# Initialize IPFS if it hasn't been initialized
if [ ! -f /data/ipfs/config ]; then
  echo "[+] Initializing IPFS with server profile..."
  ipfs init --profile=server
fi

# Configure IPFS for private cluster
echo "[+] Configuring IPFS for private cluster..."
ipfs config Addresses.API "/ip4/0.0.0.0/tcp/5001"
ipfs config Addresses.Gateway "/ip4/0.0.0.0/tcp/8080"
ipfs config Addresses.Swarm --json '["/ip4/0.0.0.0/tcp/4001", "/ip4/0.0.0.0/tcp/4001/ws"]'

# Disable public discovery and DHT
echo "[+] Disabling public discovery..."
ipfs config --json Discovery.MDNS.Enabled false
ipfs config --json Routing.Type '\"dhtclient\"'
ipfs config --json Pubsub.Enabled false

# Remove default bootstrap nodes for private cluster
echo "[+] Removing default bootstrap nodes..."
ipfs bootstrap rm --all

# Configure private swarm key (optional for extra security)
if [ ! -f /data/ipfs/swarm.key ]; then
  echo "[+] Generating private swarm key..."
  echo "/key/swarm/psk/1.0.0/" > /data/ipfs/swarm.key
  echo "/base16/" >> /data/ipfs/swarm.key
  echo "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" >> /data/ipfs/swarm.key
fi

# Set resource limits for server profile
echo "[+] Configuring resource limits..."
ipfs config --json Datastore.GCPeriod '"1h"'
ipfs config --json Swarm.ConnMgr.LowWater 100
ipfs config --json Swarm.ConnMgr.HighWater 400
ipfs config --json Swarm.ConnMgr.GracePeriod '"60s"'

# Start the daemon
echo "[+] Starting IPFS daemon in private cluster mode..."
exec ipfs daemon --enable-gc 