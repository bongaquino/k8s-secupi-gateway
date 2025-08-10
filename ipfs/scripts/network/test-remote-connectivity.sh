#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Target IP
TARGET_IP="52.77.36.120"

print_status() {
    echo -e "${YELLOW}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

# Function to test port
test_port() {
    local port=$1
    local service=$2
    if nc -z -w5 $TARGET_IP $port 2>/dev/null; then
        print_success "Port $port ($service) is open"
    else
        print_error "Port $port ($service) is closed"
    fi
}

print_status "Testing connectivity to $TARGET_IP..."

# Test basic connectivity
if ping -c 1 $TARGET_IP >/dev/null 2>&1; then
    print_success "Basic connectivity is OK"
else
    print_error "Basic connectivity failed"
    exit 1
fi

# Test common ports
test_port 22 "SSH"
test_port 80 "HTTP"
test_port 443 "HTTPS"
test_port 4001 "IPFS Swarm"
test_port 5001 "IPFS API"
test_port 8080 "IPFS Gateway"
test_port 9094 "IPFS Cluster API"
test_port 9095 "IPFS Cluster Proxy"
test_port 9096 "IPFS Cluster Proxy"

print_status "Connectivity test completed!" 