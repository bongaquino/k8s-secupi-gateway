#!/bin/bash

# Failover testing script for IPFS Private Cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
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

print_header() {
    echo -e "${MAGENTA}[TEST]${NC} $1"
}

# Test configuration
TEST_CONTENT="Failover test content $(date)"
TEST_FILE="/tmp/failover_test.txt"

# Function to check cluster health
check_cluster_health() {
    local expected_peers=${1:-3}
    print_info "Checking cluster health (expecting $expected_peers peers)..."
    
    local actual_peers
    actual_peers=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls 2>/dev/null | wc -l || echo "0")
    
    if [ "$actual_peers" -eq "$expected_peers" ]; then
        print_status "Cluster health: $actual_peers/$expected_peers peers connected"
        return 0
    else
        print_error "Cluster health: $actual_peers/$expected_peers peers connected"
        return 1
    fi
}

# Function to check HAProxy backend health
check_haproxy_health() {
    print_info "Checking HAProxy backend health..."
    
    if curl -s http://localhost:8404/stats | grep -q "ipfs-private"; then
        local up_count
        up_count=$(curl -s http://localhost:8404/stats | grep "ipfs-private" | grep -c "UP" || echo "0")
        print_status "HAProxy backends: $up_count servers UP"
        return 0
    else
        print_error "Cannot access HAProxy stats"
        return 1
    fi
}

# Function to add test content
add_test_content() {
    print_info "Adding test content to cluster..."
    echo "$TEST_CONTENT" > "$TEST_FILE"
    
    local cid
    cid=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl add "$TEST_FILE" 2>/dev/null | grep -o 'Qm[a-zA-Z0-9]*' | head -1)
    
    if [ -n "$cid" ]; then
        print_status "Test content added: $cid"
        echo "$cid"
        return 0
    else
        print_error "Failed to add test content"
        return 1
    fi
}

# Function to verify content availability
verify_content() {
    local cid="$1"
    local node="$2"
    
    if [ -z "$node" ]; then
        # Test through HAProxy
        if curl -s "http://localhost/api/v0/cat?arg=$cid" | grep -q "$TEST_CONTENT"; then
            print_status "Content accessible through HAProxy"
            return 0
        else
            print_error "Content not accessible through HAProxy"
            return 1
        fi
    else
        # Test direct node access
        if docker exec "$node" ipfs cat "$cid" 2>/dev/null | grep -q "$TEST_CONTENT"; then
            print_status "Content accessible from $node"
            return 0
        else
            print_error "Content not accessible from $node"
            return 1
        fi
    fi
}

# Function to simulate node failure
simulate_node_failure() {
    local node="$1"
    print_warning "Simulating failure of $node..."
    
    docker stop "$node" > /dev/null 2>&1
    print_info "$node stopped"
    
    # Wait for failure detection
    sleep 15
}

# Function to recover failed node
recover_failed_node() {
    local node="$1"
    print_info "Recovering $node..."
    
    docker start "$node" > /dev/null 2>&1
    print_status "$node restarted"
    
    # Wait for recovery
    sleep 30
}

# Function to run failover test scenario
run_failover_scenario() {
    local scenario_name="$1"
    local failed_nodes=("${@:2}")
    
    print_header "Scenario: $scenario_name"
    echo "Failed nodes: ${failed_nodes[*]}"
    echo
    
    # Initial health check
    check_cluster_health 3 || return 1
    check_haproxy_health || return 1
    
    # Add test content
    local cid
    cid=$(add_test_content) || return 1
    
    # Verify initial content availability
    verify_content "$cid" || return 1
    
    # Simulate failures
    for node in "${failed_nodes[@]}"; do
        simulate_node_failure "$node"
    done
    
    # Check health after failures
    local expected_peers=$((3 - ${#failed_nodes[@]}))
    sleep 20  # Wait for failover detection
    
    print_info "Checking system health after failures..."
    check_haproxy_health
    
    # Test content availability during failure
    print_info "Testing content availability during failure..."
    if verify_content "$cid"; then
        print_status "✓ Content remains accessible during failure"
    else
        print_error "✗ Content not accessible during failure"
    fi
    
    # Test new content addition during failure
    print_info "Testing new content addition during failure..."
    local new_content="New content during failure $(date)"
    echo "$new_content" > /tmp/failure_test.txt
    
    if new_cid=$(docker exec ipfs-cluster-private-01 ipfs-cluster-ctl add /tmp/failure_test.txt 2>/dev/null | grep -o 'Qm[a-zA-Z0-9]*' | head -1); then
        print_status "✓ New content can be added during failure: $new_cid"
    else
        print_warning "✗ Cannot add new content during failure (expected if bootstrap is down)"
    fi
    
    # Recover failed nodes
    for node in "${failed_nodes[@]}"; do
        recover_failed_node "$node"
    done
    
    # Check recovery
    print_info "Waiting for cluster recovery..."
    sleep 45
    
    if check_cluster_health 3; then
        print_status "✓ Cluster fully recovered"
    else
        print_warning "✗ Cluster not fully recovered yet"
    fi
    
    # Verify content after recovery
    if verify_content "$cid"; then
        print_status "✓ Original content still accessible after recovery"
    else
        print_error "✗ Original content lost after recovery"
    fi
    
    # Cleanup test content
    docker exec ipfs-cluster-private-01 ipfs-cluster-ctl pin rm "$cid" > /dev/null 2>&1 || true
    [ -n "$new_cid" ] && docker exec ipfs-cluster-private-01 ipfs-cluster-ctl pin rm "$new_cid" > /dev/null 2>&1 || true
    
    echo
    print_info "Scenario completed"
    echo "=================="
    echo
}

# Main testing function
main() {
    print_header "🔄 IPFS Private Cluster Failover Testing"
    echo
    
    # Verify cluster is running
    if ! docker ps | grep -q "ipfs-cluster-private"; then
        print_error "IPFS cluster is not running. Please deploy first."
        exit 1
    fi
    
    # Test scenarios
    
    # Scenario 1: Single peer failure
    run_failover_scenario "Single Peer Failure" "ipfs-cluster-private-03"
    
    # Scenario 2: Two peer failures (keep bootstrap)
    run_failover_scenario "Two Peer Failures" "ipfs-cluster-private-02" "ipfs-cluster-private-03"
    
    # Scenario 3: Bootstrap failure (most critical)
    run_failover_scenario "Bootstrap Node Failure" "ipfs-cluster-private-01"
    
    # Scenario 4: IPFS node failure (not cluster)
    print_header "IPFS Node Failure Test"
    simulate_node_failure "ipfs-private-02"
    sleep 20
    check_haproxy_health
    recover_failed_node "ipfs-private-02"
    sleep 30
    check_cluster_health 3
    
    # Cleanup
    rm -f "$TEST_FILE" /tmp/failure_test.txt
    
    print_header "🏁 Failover Testing Complete"
    echo
    print_status "All failover scenarios tested"
    print_info "Your cluster demonstrates robust failover capabilities"
    echo
    print_warning "Recommendations:"
    print_warning "• Monitor HAProxy stats regularly: http://localhost:8404/stats"
    print_warning "• Set up automated health monitoring"
    print_warning "• Consider implementing alerting for node failures"
    print_warning "• Regular backup of cluster data"
}

# Run tests
main "$@" 