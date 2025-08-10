# IPFS Commands Used in Our Cluster

## 1. Adding Test Files

### Bootstrap Node (211.239.117.217)
```bash
# Create and add test file
echo "Test file from Bootstrap Node" > /tmp/test1.txt
docker exec ipfs ipfs add /tmp/test1.txt
# Result: QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
```

### Peer-01 (218.38.136.33)
```bash
# Create and add test file
echo "Test file from Peer-01" > /tmp/test2.txt
docker exec ipfs ipfs add /tmp/test2.txt
# Result: QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
```

### Peer-02 (218.38.136.34)
```bash
# Create and add test file
echo "Test file from Peer-02" > /tmp/test3.txt
docker exec ipfs ipfs add /tmp/test3.txt
# Result: Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

## 2. Retrieving Files

### From Bootstrap Node
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

### From Peer-01
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

### From Peer-02
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

## 3. Current Pinned Content

### Bootstrap Node
```bash
docker exec ipfs-cluster ipfs-cluster-ctl pin ls
# Results:
# QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4 | PIN | Repl. Factor: -1 | Allocations: [everywhere]
# QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr | PIN | Repl. Factor: -1 | Allocations: [everywhere]
# Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s | PIN | Repl. Factor: 2--2 | Allocations: [12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT 12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT]
```

## 4. File Contents

### Test File 1 (Bootstrap Node)
```
Test file from Bootstrap Node
```

### Test File 2 (Peer-01)
```
Test file from Peer-01
```

### Test File 3 (Peer-02)
```
Test file from Peer-02
```

## 5. Cluster Status

### Bootstrap Node
```bash
docker exec ipfs-cluster ipfs-cluster-ctl status
# Shows all three files pinned and replicated across the cluster
```

### Peer-01
```bash
docker exec ipfs-cluster ipfs-cluster-ctl status
# Shows all three files pinned and replicated across the cluster
```

### Peer-02
```bash
docker exec ipfs-cluster ipfs-cluster-ctl status
# Shows all three files pinned and replicated across the cluster
```

## 6. Swarm Connections

### View Current Swarm Connections
```bash
# List all swarm connections
docker exec ipfs ipfs swarm peers

# List all swarm addresses
docker exec ipfs ipfs swarm addrs

# List all swarm addresses for a specific peer
docker exec ipfs ipfs swarm addrs <PEER_ID>
```

### Connect to Peers
```bash
# Connect to a specific peer
docker exec ipfs ipfs swarm connect /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>

# Example for our cluster:
# Connect to Bootstrap Node
docker exec ipfs ipfs swarm connect /ip4/211.239.117.217/tcp/4001/p2p/12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT

# Connect to Peer-01
docker exec ipfs ipfs swarm connect /ip4/218.38.136.33/tcp/4001/p2p/12D3KooWFRUStGsNyi8YGnjLDjWZDb8XLy2iz3HnhvozFobdDtPJ

# Connect to Peer-02
docker exec ipfs ipfs swarm connect /ip4/218.38.136.34/tcp/4001/p2p/12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT
```

### Disconnect from Peers
```bash
# Disconnect from a specific peer
docker exec ipfs ipfs swarm disconnect /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>
```

### Check Connection Status
```bash
# Check if connected to a specific peer
docker exec ipfs ipfs swarm peers | grep <PEER_ID>

# Get detailed connection information
docker exec ipfs ipfs swarm peers -v
```

### Our Cluster's Swarm Connections
```bash
# Bootstrap Node (211.239.117.217)
docker exec ipfs ipfs swarm peers
# Should show connections to:
# - /ip4/218.38.136.33/tcp/4001/p2p/12D3KooWFRUStGsNyi8YGnjLDjWZDb8XLy2iz3HnhvozFobdDtPJ
# - /ip4/218.38.136.34/tcp/4001/p2p/12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT

# Peer-01 (218.38.136.33)
docker exec ipfs ipfs swarm peers
# Should show connections to:
# - /ip4/211.239.117.217/tcp/4001/p2p/12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT
# - /ip4/218.38.136.34/tcp/4001/p2p/12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT

# Peer-02 (218.38.136.34)
docker exec ipfs ipfs swarm peers
# Should show connections to:
# - /ip4/211.239.117.217/tcp/4001/p2p/12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT
# - /ip4/218.38.136.33/tcp/4001/p2p/12D3KooWFRUStGsNyi8YGnjLDjWZDb8XLy2iz3HnhvozFobdDtPJ
```

### Troubleshooting Swarm Connections
```bash
# Check if ports are open
nc -zv <IP_ADDRESS> 4001

# Check if IPFS daemon is running
docker exec ipfs ipfs id

# Check network configuration
docker exec ipfs ipfs config Addresses.Swarm

# Restart swarm connections
docker exec ipfs ipfs swarm disconnect /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>
docker exec ipfs ipfs swarm connect /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>
```

## Notes
1. All files were successfully added and pinned across the cluster
2. Each node can retrieve files added by other nodes
3. The replication factor is set to -1 (everywhere) for most files
4. Some files have specific allocation targets (e.g., Peer-02 and Bootstrap)
5. All nodes maintain consistent pin status
6. Swarm connections are essential for peer-to-peer communication
7. Each node should be connected to all other nodes in the cluster
8. Port 4001 must be open for swarm connections 