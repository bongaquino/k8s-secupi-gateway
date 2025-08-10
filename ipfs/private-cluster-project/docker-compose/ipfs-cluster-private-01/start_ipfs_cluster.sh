#!/bin/sh
set -e

echo "[+] Starting IPFS Cluster Service..."
echo "[+] Node: private-cluster-01 (Bootstrap Node)"
echo "[+] Cluster Name: koneksi-private-ipfs-cluster"

# Wait for IPFS to be ready
echo "[+] Waiting for IPFS to be ready..."
until curl -s http://ipfs:5001/api/v0/version > /dev/null 2>&1; do
    echo "    Waiting for IPFS..."
    sleep 2
done

echo "[+] IPFS is ready, starting cluster service..."

# Start the IPFS Cluster service
exec /usr/local/bin/ipfs-cluster-service daemon 