# IPFS Cluster Deployment

## Overview
This repository contains scripts and configurations for deploying an IPFS cluster with multiple nodes. The setup includes a bootstrap node and peer nodes, ensuring that pins remain intact after reboots and preventing external peers from connecting to the cluster.

## Prerequisites
- Docker and Docker Compose installed on all nodes.
- SSH access to all nodes for key-based authentication.

## Setup Instructions

### SSH Key-Based Authentication
1. Generate SSH key pairs on each node:
   ```bash
   ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa -N ''
   ```
2. Add the public key of each node to the `authorized_keys` file of the other nodes to enable key-based authentication.

### UFW Firewall Configuration
1. Enable UFW on the bootstrap node:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow from <peer_ip> to any port 4001,5001,8080,9094,9096 proto tcp
   sudo ufw default deny incoming
   sudo ufw --force enable
   ```
2. Repeat the above steps for each peer node, allowing access from the bootstrap node and other peers.

## Deployment
1. Clone this repository on each node.
2. Run the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```

## Verification
- Check the status of the peers:
  ```bash
  ipfs-cluster-ctl peers ls
  ```
- Verify that no external peers are connected.

## Security
- UFW is configured to allow incoming connections only from known cluster peer IPs.
- SSH key-based authentication is used to secure access to the nodes.

## Maintenance
- Regularly check the status of the peers and firewall rules to ensure the cluster remains secure and operational.

## Common Issues and Solutions

### 1. IPFS Node Connectivity Issues

**Symptoms:**
- Nodes can't see each other
- `ipfs swarm peers` shows no connections
- Cluster status shows PIN_ERROR

**Solutions:**
1. Check IPFS node configuration:
   ```bash
   docker exec ipfs ipfs config show
   ```
   Ensure the following is set:
   ```json
   {
     "Addresses": {
       "Announce": [
         "/ip4/YOUR_PUBLIC_IP/tcp/4001"
       ]
     }
   }
   ```

2. Verify peer IDs:
   ```bash
   docker exec ipfs ipfs id
   ```
   Use the correct peer ID when connecting nodes:
   ```bash
   docker exec ipfs ipfs swarm connect /ip4/PEER_IP/tcp/4001/p2p/PEER_ID
   ```

### 2. Cluster Configuration Issues

**Symptoms:**
- Cluster nodes can't communicate
- Pins not syncing between nodes
- Status shows nodes as unreachable

**Solutions:**
1. Check cluster configuration:
   ```bash
   docker exec ipfs-cluster ipfs-cluster-ctl config show
   ```
   Ensure correct settings:
   ```json
   {
     "cluster": {
       "peername": "your-node-name",
       "listen_multiaddress": "/ip4/0.0.0.0/tcp/9096",
       "restapi": {
         "listen_multiaddress": "/ip4/0.0.0.0/tcp/9094"
       }
     }
   }
   ```

2. Verify cluster status:
   ```bash
   docker exec ipfs-cluster ipfs-cluster-ctl status
   ```

3. Manual Peer Addition:
   If automatic peer discovery is not working, you can manually add peers using the `service.json` file:
   
   a. Create or edit `service.json` in the peer's configuration directory:
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
         "/ip4/YOUR_PEER_IP/tcp/9096"
       ],
       "peer_addresses": [
         "/ip4/BOOTSTRAP_IP/tcp/9096/p2p/BOOTSTRAP_PEER_ID"
       ]
     }
   }
   ```

   b. Copy the file to the peer's data directory:
   ```bash
   scp service.json ipfs@PEER_IP:/tmp/service.json
   ssh ipfs@PEER_IP "sudo mv /tmp/service.json /data/ipfs-cluster/service.json && sudo chown ipfs:ipfs /data/ipfs-cluster/service.json"
   ```

   c. Restart the cluster service:
   ```bash
   ssh ipfs@PEER_IP "docker restart ipfs-cluster"
   ```

   d. Verify the connection:
   ```bash
   ssh ipfs@PEER_IP "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"
   ```

### 3. Storage Issues

**Symptoms:**
- Slow performance
- High disk usage
- Storage not mounting correctly

**Solutions:**
1. Check storage configuration:
   ```bash
   ./scripts/verify-storage.sh
   ```

2. Monitor RAID status:
   ```bash
   ./scripts/check-raid-status.sh
   ```

### 4. Security Issues

**Symptoms:**
- Unauthorized access attempts
- Suspicious activity in logs
- Brute force attacks

**Solutions:**
1. Check fail2ban status:
   ```bash
   sudo fail2ban-client status
   ```

2. Monitor banned IPs:
   ```bash
   sudo fail2ban-client status sshd
   sudo fail2ban-client status ipfs-api
   sudo fail2ban-client status ipfs-gateway
   ```

3. View fail2ban logs:
   ```bash
   sudo tail -f /var/log/fail2ban.log
   ```

## Server Specifications

### Hardware Configuration
- Server Model: SF7-2212W
- Operating System: Ubuntu 24.04.2 (64-bit)
- Memory: 256GB (64GB × 4)
- Storage:
  - SSD: 1TB × 2 (RAID 1) - System Drive
  - SAS: 14TB × 12 - Data Storage
- Partition Layout:
  - /dev/sdm2: swap (16GB)
  - /dev/sdm3: root (/) (876GB)

### Server IP Addresses
1. Bootstrap Node: <BOOTSTRAP_NODE_IP>
2. Peer-01 Node: <PEER_01_IP>
3. Peer-02 Node: <PEER_02_IP>

## Domain Management

### Domain Configuration
1. Bootstrap Node Domains:
<<<<<<< HEAD
   - `ipfs.example.com` - Private API endpoint (403 Forbidden for public access)
   - `gateway.example.com` - Public gateway endpoint
=======
   - `ipfs.example.com` - Private API endpoint (403 Forbidden for public access)
   - `gateway.example.com` - Public gateway endpoint
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

### SSL Configuration
1. SSL Certificates:
   - Both domains use SSL certificates from Let's Encrypt
   - Certificates are managed by certbot in Docker
   - Auto-renewal is configured every 12 hours

2. Nginx Configuration:
<<<<<<< HEAD
   - Located at: `docker-compose/bongaquino-ipfs-bootstrap-01/nginx/conf.d/default.conf`
=======
   - Located at: `docker-compose/bongaquino-ipfs-bootstrap-01/nginx/conf.d/default.conf`
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
   - Handles both HTTP and HTTPS traffic
   - Implements access control for private endpoints

3. Certificate Management:
   ```bash
   # Check certificate status
   docker exec certbot-bootstrap certbot certificates
   
   # Manual renewal
   docker exec certbot-bootstrap certbot renew
   ```

4. Access Control:
<<<<<<< HEAD
   - `ipfs.example.com` is restricted (403 Forbidden)
   - `gateway.example.com` is publicly accessible
=======
   - `ipfs.example.com` is restricted (403 Forbidden)
   - `gateway.example.com` is publicly accessible
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
   - Both domains use the same SSL certificate

## Repository Structure

```
<<<<<<< HEAD
bongaquino-ipfs/
├── README.md                          # Project documentation
├── docker-compose/                    # Docker Compose configurations
│   ├── bongaquino-ipfs-bootstrap-01/  # Bootstrap node (<BOOTSTRAP_NODE_IP>)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   ├── bongaquino-ipfs-bootstrap-02/  # New isolated bootstrap node (27.255.70.17)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   ├── bongaquino-ipfs-peer-01/       # Peer node 1 (<PEER_01_IP>)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   └── bongaquino-ipfs-peer-02/       # Peer node 2 (<PEER_02_IP>)
=======
bongaquino-ipfs/
├── README.md                          # Project documentation
├── docker-compose/                    # Docker Compose configurations
│   ├── bongaquino-ipfs-bootstrap-01/  # Bootstrap node (<BOOTSTRAP_NODE_IP>)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   ├── bongaquino-ipfs-bootstrap-02/  # New isolated bootstrap node (27.255.70.17)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   ├── bongaquino-ipfs-peer-01/       # Peer node 1 (<PEER_01_IP>)
│   │   ├── docker-compose.yml         # Container configuration
│   │   └── .env                       # Environment variables
│   └── bongaquino-ipfs-peer-02/       # Peer node 2 (<PEER_02_IP>)
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
│       ├── docker-compose.yml         # Container configuration
│       └── .env                       # Environment variables
└── scripts/                           # Deployment and maintenance scripts
    ├── check-raid-status.sh           # RAID array health monitoring
    ├── deploy.sh                      # Cluster deployment automation
    ├── setup-storage.sh               # Storage configuration and optimization
    ├── setup-fail2ban.sh              # Fail2ban installation and configuration
    └── verify-storage.sh              # Storage verification and health checks
```

## Deployment Process

### Prerequisites
1. SSH access to all nodes with key-based authentication
2. Docker and Docker Compose installed on all nodes
3. Required packages: mdadm, lvm2, smartmontools

### Initial Setup
1. Configure SSH access:
   ```bash
   # Test connection to bootstrap node
   ssh -i ~/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP> 'echo "Connection successful"'
   
   # Test connection to peer nodes
   for node in <PEER_01_IP> <PEER_02_IP>; do
     ssh -i ~/.ssh/id_rsa ipfs@$node 'echo "Connection successful"'
   done
   ```

2. Run pre-deployment checks:
   ```bash
   ./scripts/pre-deploy-check.sh
   ```

3. Deploy the cluster:
   ```bash
   ./scripts/deploy.sh
   ```

4. Verify the deployment:
   ```bash
   ./scripts/verify-cluster.sh
   ```

### Post-Deployment Tasks
1. Monitor cluster health:
   ```bash
   ./scripts/verify-cluster.sh
   ```
   
2. Check storage status:
   ```bash
   ./scripts/verify-storage.sh
   ```

3. Monitor RAID health:
   ```bash
   ./scripts/check-raid-status.sh
   ```

4. Verify security measures:
   ```bash
   # Check fail2ban status on all nodes
   for node in <BOOTSTRAP_NODE_IP> <PEER_01_IP> <PEER_02_IP>; do
     echo "=== Node: $node ==="
     ssh ipfs@$node 'sudo fail2ban-client status'
   done
   ```

## Maintenance

### Regular Checks
1. Monitor cluster health:
   ```bash
   docker exec ipfs-cluster ipfs-cluster-ctl status
   ```

2. Check storage status:
   ```bash
   ./scripts/verify-storage.sh
   ./scripts/check-raid-status.sh
   ```

3. Monitor logs:
   ```bash
   # IPFS logs
   docker logs ipfs
   
   # Cluster logs
   docker logs ipfs-cluster
   ```

### Security
1. Install and configure fail2ban:
   ```bash
   ./scripts/setup-fail2ban.sh
   ```

2. Regular security updates:
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

## Troubleshooting

### Common Commands
1. Check IPFS node status:
   ```bash
   docker exec ipfs ipfs id
   docker exec ipfs ipfs swarm peers
   ```

2. Check cluster status:
   ```bash
   docker exec ipfs-cluster ipfs-cluster-ctl status
   docker exec ipfs-cluster ipfs-cluster-ctl peers ls
   ```

3. Check storage:
   ```bash
   ./scripts/verify-storage.sh
   ./scripts/check-raid-status.sh
   ``` 

## Peering Configuration

To ensure that Peer-01 and Peer-02 can connect to the bootstrap node and each other, the following peering configuration was added to their IPFS config:

```json
"Peering": {
  "Peers": [
    {
      "ID": "12D3KooWRJRahRo8iUx9P68v3GjdiCo71A6fuYzhtcr3nrzoRmtp",
      "Addrs": ["/ip4/<BOOTSTRAP_NODE_IP>/tcp/4001"]
    },
    {
      "ID": "12D3KooWNSghb6wztPUwpTntpWvaCoR9BsDkZJAne8iy5XS6SFhv",
      "Addrs": ["/ip4/<PEER_01_IP>/tcp/4001"]
    },
    {
      "ID": "12D3KooWMovcPAJTwNgdDnB3F4jfcuY6NpGFExkU9Jhd2m6jUKGu",
      "Addrs": ["/ip4/<PEER_02_IP>/tcp/4001"]
    }
  ]
}
```

This configuration ensures that Peer-01 and Peer-02 can connect to the bootstrap node and each other, improving the overall connectivity of the IPFS cluster.

## Modifying Peering Configuration

To modify the peering configuration for IPFS nodes, follow these steps:

1. **Locate the IPFS Data Directory:**
   - The IPFS data directory is typically located at `~/.ipfs` for a user-level installation or `/data/ipfs` for a system-level installation (as in your Docker setup).

2. **Access the Configuration File:**
   - The configuration file is named `config` and is located inside the IPFS data directory.
   - For your Docker setup, the path would be:
     - **Peer-01:** `/data/ipfs/config`
     - **Peer-02:** `/data/ipfs/config`

3. **Modify the Configuration:**
   - You can modify the `config` file directly using a text editor or use the `ipfs config` command to update it.
   - For example, to update the peering configuration, you can use:
     ```bash
     docker exec ipfs ipfs config --json Peering.Peers '[{"ID":"12D3KooWRJRahRo8iUx9P68v3GjdiCo71A6fuYzhtcr3nrzoRmtp","Addrs":["/ip4/<BOOTSTRAP_NODE_IP>/tcp/4001"]},{"ID":"12D3KooWNSghb6wztPUwpTntpWvaCoR9BsDkZJAne8iy5XS6SFhv","Addrs":["/ip4/<PEER_01_IP>/tcp/4001"]},{"ID":"12D3KooWMovcPAJTwNgdDnB3F4jfcuY6NpGFExkU9Jhd2m6jUKGu","Addrs":["/ip4/<PEER_02_IP>/tcp/4001"]}]'
     ```

This section provides clear instructions on how to locate and modify the peering configuration for your IPFS nodes. 