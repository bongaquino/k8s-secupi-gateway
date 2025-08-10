#!/bin/sh
set -e

echo "[+] Starting IPFS Cluster Service..."
echo "[+] Node: private-cluster-03 (Peer Node)"
<<<<<<< HEAD
echo "[+] Cluster Name: bongaquino-private-ipfs-cluster"
=======
echo "[+] Cluster Name: koneksi-private-ipfs-cluster"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
echo "[+] Bootstrap Node: 172.21.0.10"

# Wait for IPFS to be ready
echo "[+] Waiting for IPFS to be ready..."
until curl -s http://ipfs:5001/api/v0/version > /dev/null 2>&1; do
    echo "    Waiting for IPFS..."
    sleep 2
done

echo "[+] IPFS is ready, starting cluster service..."

# Start the IPFS Cluster service
exec /usr/local/bin/ipfs-cluster-service daemon 