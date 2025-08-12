# New Cluster Expansion Guide

## Overview
This guide explains how to add new peer nodes to the isolated IPFS cluster started with bootstrap node 10.0.0.17.

## Prerequisites
- Bootstrap node (10.0.0.17) is running and healthy
- New server(s) prepared for peer node deployment
- SSH access to all nodes

## Step 1: Prepare New Peer Node Configuration

### Create Peer Node Directory
```bash
# Copy the peer-01 configuration as a template
<<<<<<< HEAD
cp -r ../example-ipfs-peer-01 ../example-ipfs-new-peer-01

# Update the configuration for the new peer
cd ../example-ipfs-new-peer-01
=======
cp -r ../example-ipfs-peer-01 ../example-ipfs-new-peer-01

# Update the configuration for the new peer
cd ../example-ipfs-new-peer-01
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

### Update Configuration Files
1. **Update `docker-compose.yml`:**
   - Change `CLUSTER_RESTAPI_HTTPANNOUNCEMULTIADDRESS` to new peer IP
   - Change `CLUSTER_SWARM_ANNOUNCE` to new peer IP
   - Change `CLUSTER_PEERNAME` to new peer name
   - Update `CLUSTER_BOOTSTRAP_PEERS` to point to new bootstrap (10.0.0.17)

2. **Update `service.json`:**
   - Change `peername` to new peer name
   - Update `announce_multiaddress` to new peer IP
   - Update `peer_addresses` to point to new bootstrap

3. **Update `start-ipfs.sh`:**
   - Update bootstrap add command to point to new bootstrap node

## Step 2: Get Bootstrap Node Information

### Get Bootstrap Peer ID
```bash
# SSH to bootstrap node
<<<<<<< HEAD
ssh admin@10.0.0.17
=======
ssh admin@10.0.0.17
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Get the peer ID
docker exec ipfs-cluster ipfs-cluster-ctl id

# Note the peer ID for configuration
```

### Get Bootstrap IPFS Peer ID
```bash
# Get IPFS peer ID
docker exec ipfs ipfs id

# Note the IPFS peer ID for peering configuration
```

## Step 3: Update Firewall Rules

### On Bootstrap Node (10.0.0.17)
```bash
# Allow new peer node
sudo ufw allow from NEW_PEER_IP to any port 4001,5001,8080,9094,9095,9096 proto tcp
sudo ufw reload
```

### On New Peer Node
```bash
# Allow bootstrap node
sudo ufw allow from 10.0.0.17 to any port 4001,5001,8080,9094,9095,9096 proto tcp

# Allow other peer nodes (if any)
sudo ufw allow from OTHER_PEER_IP to any port 4001,5001,8080,9094,9095,9096 proto tcp

sudo ufw reload
```

## Step 4: Update Peering Configuration

### Update Bootstrap Node
```bash
# SSH to bootstrap node
<<<<<<< HEAD
ssh admin@10.0.0.17
=======
ssh admin@10.0.0.17
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Update the disable-external-peers.sh script to include new peer
# Edit the Peering.Peers configuration to add new peer IPFS ID and address
```

### Example Updated Peering Configuration
```bash
docker exec ipfs ipfs config --json Peering.Peers '[
  {
    "Addrs": ["/ip4/NEW_PEER_IP/tcp/4001"],
    "ID": "NEW_PEER_IPFS_ID"
  }
]'
```

## Step 5: Deploy New Peer Node

### Copy Configuration
```bash
# Copy configuration to new peer server
<<<<<<< HEAD
scp -r example-ipfs-new-peer-01 user@NEW_PEER_IP:/home/user/ipfs/docker-compose/
=======
scp -r example-ipfs-new-peer-01 user@NEW_PEER_IP:/home/user/ipfs/docker-compose/
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

### Deploy Services
```bash
# SSH to new peer node
ssh user@NEW_PEER_IP

# Navigate to configuration directory
<<<<<<< HEAD
cd /home/user/ipfs/docker-compose/example-ipfs-new-peer-01
=======
cd /home/user/ipfs/docker-compose/example-ipfs-new-peer-01
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Make scripts executable
chmod +x *.sh

# Start services
docker-compose up -d
```

## Step 6: Verify Cluster Connectivity

### Check Cluster Status
```bash
# On bootstrap node
docker exec ipfs-cluster ipfs-cluster-ctl peers ls

# On new peer node
docker exec ipfs-cluster ipfs-cluster-ctl peers ls

# Both should show each other
```

### Check IPFS Swarm Connections
```bash
# On bootstrap node
docker exec ipfs ipfs swarm peers

# On new peer node
docker exec ipfs ipfs swarm peers

# Should show connections to each other
```

## Step 7: Test Data Replication

### Add Test Content
```bash
# On bootstrap node
echo "Test from bootstrap" > /tmp/test.txt
docker exec ipfs ipfs add /tmp/test.txt
# Note the CID

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add CID
```

### Verify Replication
```bash
# On peer node
docker exec ipfs ipfs cat CID
# Should return the test content

# Check pin status
docker exec ipfs-cluster ipfs-cluster-ctl status CID
# Should show PINNED on both nodes
```

## Troubleshooting

### Common Issues
1. **Nodes can't see each other:**
   - Check firewall rules
   - Verify peer IDs are correct
   - Check cluster secret matches

2. **Services not starting:**
   - Check Docker logs
   - Verify configuration files
   - Check port availability

3. **Pins not replicating:**
   - Check cluster connectivity
   - Verify IPFS swarm connections
   - Check cluster status

### Useful Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f ipfs
docker-compose logs -f ipfs-cluster

# Check cluster health
docker exec ipfs-cluster ipfs-cluster-ctl status

# Check IPFS connectivity
docker exec ipfs ipfs swarm peers

# Restart services
docker-compose restart
```

## Security Notes
- Always update firewall rules before adding new nodes
- Ensure cluster secret is kept secure
- Use SSH key-based authentication
- Monitor cluster for unauthorized connections
- Keep all nodes updated with security patches

## Next Steps
After successfully adding peer nodes:
1. Set up monitoring for the new cluster
2. Configure automated backups
3. Test failover scenarios
4. Document the final cluster topology
5. Set up alerting for cluster health issues 