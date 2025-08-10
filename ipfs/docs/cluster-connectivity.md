# IPFS Cluster Connectivity Documentation

## Overview
This document details how the IPFS cluster nodes are connected and configured in our infrastructure. The cluster consists of three nodes:
- Bootstrap Node (211.239.117.217)
- Peer-01 (218.38.136.33)
- Peer-02 (218.38.136.34)

## Security Configuration

### IP Whitelisting
The following IPs are whitelisted for access:
- 52.77.36.120 (Backend server)
- 211.239.117.217 (Bootstrap node)
- 218.38.136.33 (Peer-01)
- 218.38.136.34 (Peer-02)
- 119.94.162.43 (External access)
- 103.214.12.50 (External access)
- 112.200.100.154 (External access)

### Port Access
Each whitelisted IP has access to:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 5001 (IPFS API)
- Port 8080 (IPFS Gateway)

### SSH Access
- Direct SSH access is available from whitelisted IPs
- Backend server (52.77.36.120) has special access to all nodes
- SSH key-based authentication is required
- Backend server uses dedicated key pair for node access

## Setup Process

### 1. Initial Setup Order
The nodes were set up in the following sequence:
1. Bootstrap Node (Primary)
2. Peer-01 (Secondary)
3. Peer-02 (Secondary)

### 2. Bootstrap Node Setup
```bash
# Generate cluster secret
CLUSTER_SECRET=$(openssl rand -hex 32)

# Start services
docker-compose up -d

# Get peer ID
PEER_ID=$(docker exec ipfs-cluster ipfs-cluster-ctl id | jq -r '.id')
```

### 3. Peer Node Setup
For each peer node, we:
- Copy the same `CLUSTER_SECRET` from bootstrap
- Use the bootstrap node's `PEER_ID`
- Configure the node to connect to bootstrap

### 4. Manual Peer Addition
We used `service.json` to manually add peers. Here's the configuration for each node:

#### Bootstrap Node Configuration
```json
{
  "cluster": {
    "peername": "kr-bootstrap-01",
    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "listen_multiaddress": [
      "/ip4/0.0.0.0/tcp/9096",
      "/ip4/0.0.0.0/udp/9096/quic"
    ],
    "announce_multiaddress": [
      "/ip4/211.239.117.217/tcp/9096"
    ]
  }
}
```

#### Peer-01 Configuration
```json
{
  "cluster": {
    "peername": "kr-peer-01",
    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "listen_multiaddress": [
      "/ip4/0.0.0.0/tcp/9096",
      "/ip4/0.0.0.0/udp/9096/quic"
    ],
    "announce_multiaddress": [
      "/ip4/218.38.136.33/tcp/9096"
    ],
    "peer_addresses": [
      "/ip4/211.239.117.217/tcp/9096/p2p/12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT"
    ]
  }
}
```

#### Peer-02 Configuration
```json
{
  "cluster": {
    "peername": "kr-peer-02",
    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "listen_multiaddress": [
      "/ip4/0.0.0.0/tcp/9096",
      "/ip4/0.0.0.0/udp/9096/quic"
    ],
    "announce_multiaddress": [
      "/ip4/218.38.136.34/tcp/9096"
    ],
    "peer_addresses": [
      "/ip4/211.239.117.217/tcp/9096/p2p/12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT"
    ]
  }
}
```

### 5. Verification Process
After setup, we verify connectivity using:
```bash
# Check cluster status
docker exec ipfs-cluster ipfs-cluster-ctl status

# Check peer connections
docker exec ipfs-cluster ipfs-cluster-ctl peers ls
```

### 6. Key Components for Connectivity
- Same `CLUSTER_SECRET` across all nodes
- Correct `peer_addresses` pointing to bootstrap node
- Proper `announce_multiaddress` for each node
- Open ports (9096 for cluster, 4001 for IPFS)
- Docker network configuration in docker-compose.yml
- IP whitelisting for security

### 7. Troubleshooting Guide
If connectivity issues occur:
1. Check if all ports are open
2. Verify cluster secret matches
3. Check peer addresses are correct
4. Ensure services are running
5. Check logs for any errors
6. Verify IP whitelisting rules
7. Check SSH key configurations

## Benefits of This Setup
1. All nodes can communicate with each other
2. Data is properly replicated across the cluster
3. The cluster remains resilient to node failures
4. New nodes can be added easily by following the same pattern
5. Security is maintained through IP whitelisting
6. Backend server has special access for management

## Current Cluster Status
The cluster is currently fully connected with:
- Bootstrap node: `12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT`
- Peer-01: `12D3KooWFRUStGsNyi8YGnjLDjWZDb8XLy2iz3HnhvozFobdDtPJ`
- Peer-02: `12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT`

## Adding New Nodes
To add a new node to the cluster:
1. Copy the `CLUSTER_SECRET` from the bootstrap node
2. Create a new `service.json` with the new node's configuration
3. Add the bootstrap node's peer address to the new node's configuration
4. Start the services and verify connectivity
5. Add the new node's IP to the whitelist
6. Configure SSH access if needed

## Security Considerations
1. The `CLUSTER_SECRET` is shared only between trusted nodes
2. All nodes use secure communication over TLS
3. Access to the cluster API is restricted to internal network
4. Regular security audits are performed
5. IP whitelisting is enforced
6. SSH key-based authentication is required
7. Backend server has special access privileges

## Maintenance
Regular maintenance tasks include:
1. Monitoring cluster health
2. Checking node connectivity
3. Verifying data replication
4. Updating node configurations as needed
5. Backing up important data
6. Reviewing and updating IP whitelist
7. Rotating SSH keys periodically

## Support
For any issues or questions regarding the cluster setup, please contact the system administrators or refer to the troubleshooting guide above.

## IPFS Content Management Commands

### 1. Adding Content to IPFS
```bash
# Add a single file
docker exec ipfs ipfs add /path/to/file.txt

# Add a directory recursively
docker exec ipfs ipfs add -r /path/to/directory

# Add content with specific pinning options
docker exec ipfs ipfs add --pin=false /path/to/file.txt  # Don't pin automatically
docker exec ipfs ipfs add --raw-leaves /path/to/file.txt  # Use raw blocks for leaf nodes
```

### 2. Pinning Content
```bash
# Pin a file using its CID
docker exec ipfs ipfs pin add <CID>

# Pin recursively (for directories)
docker exec ipfs ipfs pin add -r <CID>

# List all pinned content
docker exec ipfs ipfs pin ls

# Remove a pin
docker exec ipfs ipfs pin rm <CID>
```

### 3. Retrieving Content
```bash
# Get content using its CID
docker exec ipfs ipfs cat <CID>

# Download content to a file
docker exec ipfs ipfs get <CID> -o output.txt

# List directory contents
docker exec ipfs ipfs ls <CID>
```

### 4. Cluster-Specific Commands
```bash
# Add and pin content to the cluster
docker exec ipfs-cluster ipfs-cluster-ctl add /path/to/file.txt

# Pin existing content in the cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add <CID>

# List all pinned content in the cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin ls

# Remove pin from the cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin rm <CID>

# Check status of pinned content
docker exec ipfs-cluster ipfs-cluster-ctl status <CID>
```

### 5. Common Use Cases

#### Adding and Pinning a File
```bash
# Add file to IPFS
CID=$(docker exec ipfs ipfs add -q /path/to/file.txt)

# Pin it in the cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add $CID
```

#### Adding and Pinning a Directory
```bash
# Add directory to IPFS
CID=$(docker exec ipfs ipfs add -r -q /path/to/directory)

# Pin it in the cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add $CID
```

#### Retrieving and Verifying Content
```bash
# Get content
docker exec ipfs ipfs get <CID> -o output.txt

# Verify content matches original
docker exec ipfs ipfs add -n output.txt  # Should show same CID
```

### 6. Best Practices
1. Always use cluster commands for pinning to ensure replication
2. Verify content after retrieval
3. Use appropriate pinning strategies based on content importance
4. Monitor pin status regularly
5. Keep track of CIDs for important content
6. Follow security best practices for access control
7. Regularly update IP whitelist as needed

## Audit Log: Cluster Peer Connectivity

**Date:** 2024-06-05

**Summary:**
As of this date, only the three cluster nodes are connected as IPFS swarm peers and cluster peers. No external or public peers are present.

### Terminal Output Evidence

#### Bootstrap Node Swarm Peers
```
/ip4/218.38.136.33/tcp/4001/p2p/12D3KooWNSghb6wztPUwpTntpWvaCoR9BsDkZJAne8iy5XS6SFhv
/ip4/218.38.136.34/tcp/4001/p2p/12D3KooWMovcPAJTwNgdDnB3F4jfcuY6NpGFExkU9Jhd2m6jUKGu
```

#### Peer-01 Swarm Peers
```
/ip4/211.239.117.217/tcp/4001/p2p/12D3KooWE4Lzj5AhHin4MkinfGRPagNeeu9bHVBZua7kLNie1qzA
/ip4/218.38.136.34/tcp/4001/p2p/12D3KooWMovcPAJTwNgdDnB3F4jfcuY6NpGFExkU9Jhd2m6jUKGu
```

#### Peer-02 Swarm Peers
```
/ip4/211.239.117.217/tcp/4001/p2p/12D3KooWE4Lzj5AhHin4MkinfGRPagNeeu9bHVBZua7kLNie1qzA
/ip4/218.38.136.33/tcp/4001/p2p/12D3KooWNSghb6wztPUwpTntpWvaCoR9BsDkZJAne8iy5XS6SFhv
```

#### Cluster Peer List
```
12D3KooWSv57nfbit9pKb2BbmBRwRsWTnaHc4rk1NccuC1QBMGAT | kr-bootstrap-01 | Sees 2 other peers
12D3KooWDAru6Qgr9qyaNcrdf9VBtHKQUTbSRtdaWSimMtENZYqT | kr-peer-02      | Sees 2 other peers
12D3KooWFRUStGsNyi8YGnjLDjWZDb8XLy2iz3HnhvozFobdDtPJ | kr-peer-01      | Sees 2 other peers
```

**Conclusion:**
All technical evidence confirms that only the three cluster nodes are connected as peers, with no external or public peers present as of this audit date.

## Firewall Whitelist Update

**Date:** 2024-06-05

**Summary:**
The following IPs have been whitelisted in the firewall for all nodes in the cluster:

### Cluster Nodes
- Bootstrap Node: 211.239.117.217
- Peer-01: 218.38.136.33
- Peer-02: 218.38.136.34

### External Access
- HostCenter Monitoring IP: 110.10.81.170
- HostCenter Management IP: 121.125.68.226
- JB's IP: 169.150.218.66
- Franz's IP: 157.20.143.170
- Aldric's IP: 49.145.0.190
<<<<<<< HEAD
- bongaquino Staging Backend: 52.77.36.120
=======
- Koneksi Staging Backend: 52.77.36.120
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
- Alex's IP: 119.94.162.43
- Bong's IP: 112.200.100.154

### Firewall Rules Applied
- **Bootstrap Node (211.239.117.217):**
  - Allow from 211.239.117.217 (Bootstrap Node) to Anywhere
  - Allow from 218.38.136.33 (Peer-01) to Anywhere
  - Allow from 218.38.136.34 (Peer-02) to Anywhere
  - Allow from 110.10.81.170 (HostCenter Monitoring IP) to Anywhere
  - Allow from 121.125.68.226 (HostCenter Management IP) to Anywhere
  - Allow from 169.150.218.66 (JB's IP) to Anywhere
  - Allow from 157.20.143.170 (Franz's IP) to Anywhere
  - Allow from 49.145.0.190 (Aldric's IP) to Anywhere
<<<<<<< HEAD
  - Allow from 52.77.36.120 (bongaquino Staging Backend) to Anywhere
=======
  - Allow from 52.77.36.120 (Koneksi Staging Backend) to Anywhere
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
  - Allow from 119.94.162.43 (Alex's IP) to Anywhere
  - Allow from 112.200.100.154 (Bong's IP) to Anywhere

- **Peer-01 (218.38.136.33):**
  - Allow from 211.239.117.217 (Bootstrap Node) to Anywhere
  - Allow from 218.38.136.33 (Peer-01) to Anywhere
  - Allow from 218.38.136.34 (Peer-02) to Anywhere
  - Allow from 110.10.81.170 (HostCenter Monitoring IP) to Anywhere
  - Allow from 121.125.68.226 (HostCenter Management IP) to Anywhere
  - Allow from 169.150.218.66 (JB's IP) to Anywhere
  - Allow from 157.20.143.170 (Franz's IP) to Anywhere
  - Allow from 49.145.0.190 (Aldric's IP) to Anywhere
<<<<<<< HEAD
  - Allow from 52.77.36.120 (bongaquino Staging Backend) to Anywhere
=======
  - Allow from 52.77.36.120 (Koneksi Staging Backend) to Anywhere
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
  - Allow from 119.94.162.43 (Alex's IP) to Anywhere
  - Allow from 112.200.100.154 (Bong's IP) to Anywhere

- **Peer-02 (218.38.136.34):**
  - Allow from 211.239.117.217 (Bootstrap Node) to Anywhere
  - Allow from 218.38.136.33 (Peer-01) to Anywhere
  - Allow from 218.38.136.34 (Peer-02) to Anywhere
  - Allow from 110.10.81.170 (HostCenter Monitoring IP) to Anywhere
  - Allow from 121.125.68.226 (HostCenter Management IP) to Anywhere
  - Allow from 169.150.218.66 (JB's IP) to Anywhere
  - Allow from 157.20.143.170 (Franz's IP) to Anywhere
  - Allow from 49.145.0.190 (Aldric's IP) to Anywhere
<<<<<<< HEAD
  - Allow from 52.77.36.120 (bongaquino Staging Backend) to Anywhere
=======
  - Allow from 52.77.36.120 (Koneksi Staging Backend) to Anywhere
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
  - Allow from 119.94.162.43 (Alex's IP) to Anywhere
  - Allow from 112.200.100.154 (Bong's IP) to Anywhere

### Steps to Whitelist IPs
1. **Update Firewall Rules:**
   - Use the `update-nodes.sh` script to add the new IPs to the whitelist:
     ```bash
     sudo ufw allow from <IP_ADDRESS> to any comment '<DESCRIPTION>'
     ```
   - Example:
     ```bash
     sudo ufw allow from 211.239.117.217 to any comment 'Bootstrap Node'
     sudo ufw allow from 218.38.136.33 to any comment 'Peer-01'
     sudo ufw allow from 218.38.136.34 to any comment 'Peer-02'
     sudo ufw allow from 110.10.81.170 to any comment 'HostCenter Monitoring IP'
     sudo ufw allow from 121.125.68.226 to any comment 'HostCenter Management IP'
     sudo ufw allow from 169.150.218.66 to any comment 'JB IP'
     sudo ufw allow from 157.20.143.170 to any comment 'Franz IP'
     sudo ufw allow from 49.145.0.190 to any comment 'Aldric IP'
<<<<<<< HEAD
     sudo ufw allow from 52.77.36.120 to any comment 'bongaquino Staging Backend'
=======
     sudo ufw allow from 52.77.36.120 to any comment 'Koneksi Staging Backend'
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
     sudo ufw allow from 119.94.162.43 to any comment 'Alex IP'
     sudo ufw allow from 112.200.100.154 to any comment 'Bong IP'
     ```

2. **Reload Firewall:**
   - After adding the rules, reload the firewall to apply the changes:
     ```bash
     sudo ufw reload
     ```

3. **Verify Rules:**
   - Check the current firewall rules to ensure the new IPs are whitelisted:
     ```bash
     sudo ufw status verbose
     ```

**Conclusion:**
All nodes have been updated to allow traffic from the specified IPs, ensuring secure and controlled access to the cluster. 