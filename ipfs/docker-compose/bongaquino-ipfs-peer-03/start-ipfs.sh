#!/bin/sh
set -e

# Initialize IPFS if it hasn't been initialized
if [ ! -f /data/ipfs/config ]; then
  echo "[+] Initializing IPFS..."
  ipfs init
fi

# Configure IPFS to listen on all interfaces
echo "[+] Configuring IPFS..."
ipfs config Addresses.API "/ip4/0.0.0.0/tcp/5001"
ipfs config Addresses.Gateway "/ip4/0.0.0.0/tcp/8080"
ipfs config Addresses.Swarm --json '["/ip4/0.0.0.0/tcp/4001", "/ip4/0.0.0.0/tcp/4001/ws"]'

# Bootstrap to the bootstrap node
echo "[+] Configuring bootstrap nodes..."
ipfs bootstrap rm --all
ipfs bootstrap add /ip4/27.255.70.17/tcp/4001/p2p/12D3KooWApLN3436Fhz7vRssLwNxsGJr6CpHN4fUVM8e8DPn9gwc

# Start the daemon
echo "[+] Starting IPFS daemon..."
exec ipfs daemon 