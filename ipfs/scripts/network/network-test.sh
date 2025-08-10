#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Node IPs
BOOTSTRAP_NODE="211.239.117.217"
PEER_NODE="218.38.136.34"

print_status() {
    echo -e "${YELLOW}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root"
    exit 1
fi

# Install iperf3
print_status "Installing iperf3..."
apt-get update && apt-get install -y iperf3

# Check if we're on bootstrap or peer node
if [ "$(hostname -I | grep $BOOTSTRAP_NODE)" ]; then
    print_status "Running on bootstrap node. Starting iperf3 server..."
    iperf3 -s
elif [ "$(hostname -I | grep $PEER_NODE)" ]; then
    print_status "Running on peer node. Starting iperf3 client..."
    iperf3 -c $BOOTSTRAP_NODE -t 30
else
    print_error "Not running on either bootstrap or peer node"
    exit 1
fi

print_success "Network test completed!" 