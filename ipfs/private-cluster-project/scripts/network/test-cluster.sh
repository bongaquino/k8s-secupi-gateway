#!/bin/bash

# Network testing script for IPFS Private Cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_info "🔍 Testing IPFS Private Cluster Network Connectivity"
echo

# Test HAProxy
print_info "Testing HAProxy Load Balancer..."
if curl -s http://localhost:8404/stats > /dev/null; then
    print_status "HAProxy stats page accessible"
else
    print_error "HAProxy stats page not accessible"
fi

# Test IPFS API through HAProxy
print_info "Testing IPFS API through HAProxy..."
if curl -s http://localhost/api/v0/version > /dev/null; then
    print_status "IPFS API accessible through load balancer"
else
    print_error "IPFS API not accessible through load balancer"
fi

# Test direct node connections
print_info "Testing direct node connections..."
for i in {1..3}; do
    container="ipfs-cluster-private-0$i"
    print_info "Testing $container..."
    
    # Test IPFS node
    if docker exec "$container" ipfs id > /dev/null 2>&1; then
        print_status "$container IPFS node responding"
    else
        print_error "$container IPFS node not responding"
    fi
    
    # Test cluster node
    if docker exec "$container" ipfs-cluster-ctl id > /dev/null 2>&1; then
        print_status "$container cluster service responding"
    else
        print_error "$container cluster service not responding"
    fi
done

# Test cluster peer connectivity
print_info "Testing cluster peer connectivity..."
peers=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls 2>/dev/null | wc -l || echo "0")
if [ "$peers" -eq 3 ]; then
    print_status "All 3 cluster peers connected"
    
    # Show peer details
    print_info "Cluster peer details:"
    docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls
else
    print_error "Only $peers peers connected (expected 3)"
fi

# Test IPFS swarm connectivity
print_info "Testing IPFS swarm connectivity..."
for i in {1..3}; do
    container="ipfs-private-0$i"
    swarm_peers=$(docker exec "$container" ipfs swarm peers 2>/dev/null | wc -l || echo "0")
    if [ "$swarm_peers" -eq 2 ]; then
        print_status "$container connected to 2 IPFS peers"
    else
        print_warning "$container connected to $swarm_peers IPFS peers (expected 2)"
    fi
done

# Test content replication
print_info "Testing content replication..."
test_content="Test content $(date)"
echo "$test_content" > /tmp/test_file.txt

# Add content to cluster
if cid=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl add /tmp/test_file.txt 2>/dev/null | grep -o 'Qm[a-zA-Z0-9]*' | head -1); then
    print_status "Content added to cluster: $cid"
    
    # Wait for replication
    sleep 5
    
    # Test retrieval from each node
    for i in {1..3}; do
        container="ipfs-private-0$i"
        if retrieved=$(docker exec "$container" ipfs cat "$cid" 2>/dev/null); then
            if [ "$retrieved" = "$test_content" ]; then
                print_status "Content retrieved correctly from $container"
            else
                print_error "Content mismatch from $container"
            fi
        else
            print_error "Cannot retrieve content from $container"
        fi
    done
    
    # Cleanup test content
    docker exec ipfs-cluster-private-01 ipfs-cluster-ctl pin rm "$cid" > /dev/null 2>&1 || true
else
    print_error "Failed to add test content to cluster"
fi

# Test HAProxy load balancing
print_info "Testing HAProxy load balancing..."
for i in {1..5}; do
    response=$(curl -s http://localhost/api/v0/id | jq -r '.ID' 2>/dev/null || echo "error")
    if [ "$response" != "error" ]; then
        print_status "Load balancer request $i successful: $response"
    else
        print_error "Load balancer request $i failed"
    fi
done

# Cleanup
rm -f /tmp/test_file.txt

echo
print_info "🏁 Network connectivity test completed" 