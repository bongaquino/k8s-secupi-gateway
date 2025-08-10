#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Node IPs and Domains
BOOTSTRAP_NODE="<BOOTSTRAP_NODE_IP>"
PEER_01="<PEER_01_IP>"
PEER_02="<PEER_02_IP>"
<<<<<<< HEAD
IPFS_API_DOMAIN="ipfs.example.com"
IPFS_GATEWAY_DOMAIN="gateway.example.com"
=======
IPFS_API_DOMAIN="ipfs.koneksi.com"
IPFS_GATEWAY_DOMAIN="gateway.koneksi.com"
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Required ports
PORTS="4001 9094 9096"

print_status() {
    echo -e "${YELLOW}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

test_port() {
    local host=$1
    local port=$2
    if nc -zv -w5 $host $port 2>&1 | grep -q "succeeded"; then
        print_success "Port $port on $host is open"
        return 0
    else
        print_error "Port $port on $host is closed"
        return 1
    fi
}

test_https_endpoint() {
    local domain=$1
    local path=$2
    local description=$3
    
    if curl -s -k "https://$domain$path" > /dev/null; then
        print_success "HTTPS endpoint $description ($domain$path) is accessible"
        return 0
    else
        print_error "HTTPS endpoint $description ($domain$path) is not accessible"
        return 1
    fi
}

test_node_connectivity() {
    local node=$1
    local node_name=$2
    print_status "Testing connectivity to $node_name ($node)..."
    
    # Test basic connectivity
    if ping -c 1 -W 5 $node > /dev/null 2>&1; then
        print_success "Basic connectivity to $node_name is OK"
    else
        print_error "Basic connectivity to $node_name failed"
        return 1
    fi
    
    # Test required ports
    for port in $PORTS; do
        test_port $node $port
    done
}

# Test connectivity between all nodes
print_status "Starting cluster connectivity test..."

# Test Bootstrap Node
test_node_connectivity $BOOTSTRAP_NODE "Bootstrap Node"

# Test Peer-01
test_node_connectivity $PEER_01 "Peer-01"

# Test Peer-02
test_node_connectivity $PEER_02 "Peer-02"

print_status "Testing HTTPS endpoints..."

# Test IPFS API endpoint
test_https_endpoint $IPFS_API_DOMAIN "/api/v0/version" "IPFS API"

# Test IPFS Gateway endpoint
test_https_endpoint $IPFS_GATEWAY_DOMAIN "/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o" "IPFS Gateway"

print_status "Testing inter-node connectivity..."

# Test Bootstrap -> Peer-01
print_status "Testing Bootstrap -> Peer-01 connectivity..."
for port in $PORTS; do
    ssh ipfs@$BOOTSTRAP_NODE "nc -zv -w5 $PEER_01 $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Bootstrap -> Peer-01 OK" || \
        print_error "Port $port: Bootstrap -> Peer-01 failed"
done

# Test Bootstrap -> Peer-02
print_status "Testing Bootstrap -> Peer-02 connectivity..."
for port in $PORTS; do
    ssh ipfs@$BOOTSTRAP_NODE "nc -zv -w5 $PEER_02 $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Bootstrap -> Peer-02 OK" || \
        print_error "Port $port: Bootstrap -> Peer-02 failed"
done

# Test Peer-01 -> Bootstrap
print_status "Testing Peer-01 -> Bootstrap connectivity..."
for port in $PORTS; do
    ssh ipfs@$PEER_01 "nc -zv -w5 $BOOTSTRAP_NODE $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Peer-01 -> Bootstrap OK" || \
        print_error "Port $port: Peer-01 -> Bootstrap failed"
done

# Test Peer-01 -> Peer-02
print_status "Testing Peer-01 -> Peer-02 connectivity..."
for port in $PORTS; do
    ssh ipfs@$PEER_01 "nc -zv -w5 $PEER_02 $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Peer-01 -> Peer-02 OK" || \
        print_error "Port $port: Peer-01 -> Peer-02 failed"
done

# Test Peer-02 -> Bootstrap
print_status "Testing Peer-02 -> Bootstrap connectivity..."
for port in $PORTS; do
    ssh ipfs@$PEER_02 "nc -zv -w5 $BOOTSTRAP_NODE $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Peer-02 -> Bootstrap OK" || \
        print_error "Port $port: Peer-02 -> Bootstrap failed"
done

# Test Peer-02 -> Peer-01
print_status "Testing Peer-02 -> Peer-01 connectivity..."
for port in $PORTS; do
    ssh ipfs@$PEER_02 "nc -zv -w5 $PEER_01 $port" 2>&1 | grep -q "succeeded" && \
        print_success "Port $port: Peer-02 -> Peer-01 OK" || \
        print_error "Port $port: Peer-02 -> Peer-01 failed"
done

print_status "Cluster connectivity test completed!" 