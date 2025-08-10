#!/bin/bash

# Stop script for IPFS Private Cluster Project

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

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

print_status "🛑 Stopping IPFS Private Cluster..."

# Stop cluster nodes
print_status "Stopping IPFS cluster nodes..."
cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-01" && docker-compose down || true
cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-02" && docker-compose down || true
cd "$PROJECT_ROOT/docker-compose/ipfs-cluster-private-03" && docker-compose down || true

# Stop HAProxy
print_status "Stopping HAProxy load balancer..."
cd "$PROJECT_ROOT/docker-compose/haproxy-public" && docker-compose down || true

print_status "✅ All services stopped" 