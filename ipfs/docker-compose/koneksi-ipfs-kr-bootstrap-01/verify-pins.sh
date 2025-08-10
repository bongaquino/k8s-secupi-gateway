#!/bin/bash
set -e

# Wait for IPFS to be ready
echo "Waiting for IPFS to be ready..."
until docker exec ipfs ipfs id > /dev/null 2>&1; do
    sleep 1
done

# Wait for IPFS Cluster to be ready
echo "Waiting for IPFS Cluster to be ready..."
until docker exec ipfs-cluster ipfs-cluster-ctl id > /dev/null 2>&1; do
    sleep 1
done

# Get all pins from the cluster
echo "Getting all pins..."
PINS=$(docker exec ipfs-cluster ipfs-cluster-ctl status | grep -o 'Qm[a-zA-Z0-9]*' | sort | uniq)

# Verify each pin
for PIN in $PINS; do
    echo "Verifying pin: $PIN"
    STATUS=$(docker exec ipfs-cluster ipfs-cluster-ctl status $PIN)
    
    # Check if any node shows REMOTE or ERROR state
    if echo "$STATUS" | grep -q "REMOTE\|ERROR"; then
        echo "Recovering pin: $PIN"
        docker exec ipfs-cluster ipfs-cluster-ctl pin add $PIN
    fi
done

echo "Pin verification complete" 