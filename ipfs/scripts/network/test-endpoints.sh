#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Node IPs
BOOTSTRAP_IP="<BOOTSTRAP_NODE_IP>"
PEER1_IP="<PEER_01_IP>"
PEER2_IP="<PEER_02_IP>"

# Test CIDs
BOOTSTRAP_CID="QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4"
PEER1_CID="QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr"
PEER2_CID="Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s"

# Test File CID
FILE_CID="QmRvu2hMWJ2NtyQg37t1gKo4KnaC4HZiNXcTSeuRsXMtj3"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local method=${3:-GET}
    local data=$4
    local follow_redirects=${5:-false}

    local curl_opts="-s"
    if [ "$follow_redirects" = true ]; then
        curl_opts="$curl_opts -L"
    fi

    if [ -z "$data" ]; then
        response=$(curl $curl_opts -X $method "$url" -w "\n%{http_code}")
    else
        response=$(curl $curl_opts -X $method "$url" -H "Content-Type: application/json" -d "$data" -w "\n%{http_code}")
    fi

    status_code=$(echo "$response" | tail -n1)
    if [ "$status_code" -eq 200 ] || [ "$status_code" -eq 201 ]; then
        print_result 0 "$description"
    else
        print_result 1 "$description (Status: $status_code)"
        echo "Error Response: $(echo "$response" | sed '$d')" # Log the error response
    fi
}

echo "Testing IPFS Cluster Endpoints..."
echo "================================="

# Test Cluster Status (using /id instead of /status)
echo -e "\nTesting Cluster Status:"
test_endpoint "http://$BOOTSTRAP_IP:9094/id" "Bootstrap Node Cluster Status"
test_endpoint "http://$PEER1_IP:9094/id" "Peer-01 Cluster Status"
test_endpoint "http://$PEER2_IP:9094/id" "Peer-02 Cluster Status"

# Test Peer Status
echo -e "\nTesting Peer Status:"
test_endpoint "http://$BOOTSTRAP_IP:9094/peers" "Bootstrap Node Peer Status"
test_endpoint "http://$PEER1_IP:9094/peers" "Peer-01 Peer Status"
test_endpoint "http://$PEER2_IP:9094/peers" "Peer-02 Peer Status"

# Test Pin Status
echo -e "\nTesting Pin Status:"
test_endpoint "http://$BOOTSTRAP_IP:9094/pins" "Bootstrap Node Pin List"
test_endpoint "http://$PEER1_IP:9094/pins" "Peer-01 Pin List"
test_endpoint "http://$PEER2_IP:9094/pins" "Peer-02 Pin List"

# Test IPFS Node Info (using POST method)
echo -e "\nTesting IPFS Node Info:"
test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/id" "Bootstrap Node IPFS Info" "POST"
test_endpoint "http://$PEER1_IP:5001/api/v0/id" "Peer-01 IPFS Info" "POST"
test_endpoint "http://$PEER2_IP:5001/api/v0/id" "Peer-02 IPFS Info" "POST"

# Test Swarm Peers (using POST method)
echo -e "\nTesting Swarm Peers:"
test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/swarm/peers" "Bootstrap Node Swarm Peers" "POST"
test_endpoint "http://$PEER1_IP:5001/api/v0/swarm/peers" "Peer-01 Swarm Peers" "POST"
test_endpoint "http://$PEER2_IP:5001/api/v0/swarm/peers" "Peer-02 Swarm Peers" "POST"

# Test Content Retrieval (with redirect following)
echo -e "\nTesting Content Retrieval:"
test_endpoint "http://$BOOTSTRAP_IP:8080/ipfs/$BOOTSTRAP_CID" "Bootstrap Node Content (Gateway)" "GET" "" true
test_endpoint "http://$PEER1_IP:8080/ipfs/$PEER1_CID" "Peer-01 Content (Gateway)" "GET" "" true
test_endpoint "http://$PEER2_IP:8080/ipfs/$PEER2_CID" "Peer-02 Content (Gateway)" "GET" "" true

# Test API Content Retrieval (using POST method)
#echo -e "\nTesting Directory Content Retrieval (API):"
#test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/cat?arg=$BOOTSTRAP_CID" "Bootstrap Node Directory Content (API)" "POST"
#test_endpoint "http://$PEER1_IP:5001/api/v0/cat?arg=$PEER1_CID" "Peer-01 Directory Content (API)" "POST"
#test_endpoint "http://$PEER2_IP:5001/api/v0/cat?arg=$PEER2_CID" "Peer-02 Directory Content (API)" "POST"

# Test Directory Listing (using POST method)
echo -e "\nTesting Directory Listing:"
test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/ls?arg=$BOOTSTRAP_CID" "Bootstrap Node Directory Listing" "POST"
test_endpoint "http://$PEER1_IP:5001/api/v0/ls?arg=$PEER1_CID" "Peer-01 Directory Listing" "POST"
test_endpoint "http://$PEER2_IP:5001/api/v0/ls?arg=$PEER2_CID" "Peer-02 Directory Listing" "POST"

# Test File Content Retrieval (API)
#echo -e "\nTesting File Content Retrieval (API):"
#test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/cat?arg=$FILE_CID" "Bootstrap Node File Content (API)" "POST"
#test_endpoint "http://$PEER1_IP:5001/api/v0/cat?arg=$FILE_CID" "Peer-01 File Content (API)" "POST"
#test_endpoint "http://$PEER2_IP:5001/api/v0/cat?arg=$FILE_CID" "Peer-02 File Content (API)" "POST"

# Test File Directory Listing (API)
#echo -e "\nTesting File Directory Listing (API):"
#test_endpoint "http://$BOOTSTRAP_IP:5001/api/v0/ls?arg=$FILE_CID" "Bootstrap Node File Directory Listing" "POST"
#test_endpoint "http://$PEER1_IP:5001/api/v0/ls?arg=$FILE_CID" "Peer-01 File Directory Listing" "POST"
#test_endpoint "http://$PEER2_IP:5001/api/v0/ls?arg=$FILE_CID" "Peer-02 File Directory Listing" "POST"

echo -e "\nTesting Complete!" 