#!/bin/bash

# Cleanup script for IPFS Private Cluster Project
# WARNING: This will remove all data!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

print_warning "⚠️  This will completely remove all IPFS cluster data and containers!"
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Cleanup cancelled"
    exit 0
fi

print_status "🧹 Starting cleanup..."

# Stop all services first
print_status "Stopping all services..."
"$PROJECT_ROOT/scripts/deployment/stop-all.sh"

# Remove containers
print_status "Removing containers..."
docker rm -f haproxy-public certbot-haproxy nginx-ssl || true
docker rm -f ipfs-private-01 ipfs-cluster-private-01 || true
docker rm -f ipfs-private-02 ipfs-cluster-private-02 || true
docker rm -f ipfs-private-03 ipfs-cluster-private-03 || true

# Remove volumes
print_status "Removing Docker volumes..."
docker volume prune -f

# Remove networks
print_status "Removing Docker networks..."
docker network rm private-cluster-project_public_network || true
docker network rm private-cluster-project_private_network || true

# Remove data directories (optional)
read -p "Remove data directories (/data/ipfs-private-*)? (yes/no): " remove_data
if [ "$remove_data" = "yes" ]; then
    print_status "Removing data directories..."
    sudo rm -rf /data/ipfs-private-*
    sudo rm -rf /data/ipfs-cluster-private-*
fi

# Clean up built images
print_status "Cleaning up Docker images..."
docker image prune -f

print_status "✅ Cleanup completed" 