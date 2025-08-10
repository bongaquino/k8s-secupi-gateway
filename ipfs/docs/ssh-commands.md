# SSH Commands Used in IPFS Cluster Testing

## Current SSH Access Configuration (Updated: 2025-01-27)

### Node Information
- **Bootstrap Node:** <BOOTSTRAP_NODE_IP>
- **Peer-01:** <PEER_01_IP>
- **Peer-02:** <PEER_02_IP>
- **Backend Server:** <BACKEND_SERVER_IP> (Staging Backend)
- **UAT Bastion:** <UAT_BASTION_IP> (UAT-Bastion)

## SSH Access Matrix

### Bootstrap Node (<BOOTSTRAP_NODE_IP>)
- ✅ **Public SSH Access:** Open to all (Anywhere)
- ✅ **Peer-01:** <PEER_01_IP>
- ✅ **Peer-02:** <PEER_02_IP>
- ✅ **Backend Server:** <BACKEND_SERVER_IP>
- ✅ **UAT Bastion:** <UAT_BASTION_IP>

### Peer-01 (<PEER_01_IP>)
- ✅ **Admin IP:** <ADMIN_IP>
- ✅ **Bootstrap Node:** <BOOTSTRAP_NODE_IP>
- ✅ **Peer-02:** <PEER_02_IP>
- ✅ **Backend Server:** <BACKEND_SERVER_IP>
- ✅ **UAT Bastion:** <UAT_BASTION_IP>

### Peer-02 (<PEER_02_IP>)
- ✅ **Admin IP:** <ADMIN_IP>
- ✅ **Bootstrap Node:** <BOOTSTRAP_NODE_IP>
- ✅ **Peer-01:** <PEER_01_IP>
- ✅ **Backend Server:** <BACKEND_SERVER_IP>
- ✅ **UAT Bastion:** <UAT_BASTION_IP>

## SSH Commands by Node

### 1. Bootstrap Node (<BOOTSTRAP_NODE_IP>)

#### SSH Access
```bash
# Direct SSH access (from any IP)
ssh ipfs@<BOOTSTRAP_NODE_IP>

# SSH via backend server
ssh -i ~/.ssh/backend-key.pem ubuntu@<BACKEND_SERVER_IP>
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@<BOOTSTRAP_NODE_IP>

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@<UAT_BASTION_IP>
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP>
```

#### Adding and Pinning Files
```bash
# SSH into bootstrap node
ssh ipfs@<BOOTSTRAP_NODE_IP>

# Create test file
echo "Test file from Bootstrap Node" > /tmp/test1.txt

# Add to IPFS
docker exec ipfs ipfs add /tmp/test1.txt
# Result: QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4

# Check pin status
docker exec ipfs-cluster ipfs-cluster-ctl pin ls
```

#### Retrieving Files
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

### 2. Peer-01 (<PEER_01_IP>)

#### SSH Access
```bash
# Direct SSH access (from whitelisted IPs only)
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP>

# SSH via backend server
<<<<<<< HEAD
ssh -i ~/.ssh/bongaquino-ipfs-backend.pem ubuntu@<BACKEND_SERVER_IP>
=======
ssh -i ~/.ssh/backend-key.pem ubuntu@<BACKEND_SERVER_IP>
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@<PEER_01_IP>

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@<UAT_BASTION_IP>
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@<PEER_01_IP>

# SSH via bootstrap node
ssh -i ~/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP>
ssh -i /home/ipfs/.ssh/id_rsa ipfs@<PEER_01_IP>
```

#### Adding and Pinning Files
```bash
# SSH into peer-01
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP>

# Create test file
echo "Test file from Peer-01" > /tmp/test2.txt

# Add to IPFS
docker exec ipfs ipfs add /tmp/test2.txt
# Result: QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr

# Check pin status
docker exec ipfs-cluster ipfs-cluster-ctl pin ls
```

#### Retrieving Files
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

### 3. Peer-02 (<PEER_02_IP>)

#### SSH Access
```bash
# Direct SSH access (from whitelisted IPs only)
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP>

# SSH via backend server
<<<<<<< HEAD
ssh -i ~/.ssh/bongaquino-ipfs-backend.pem ubuntu@<BACKEND_SERVER_IP>
=======
ssh -i ~/.ssh/backend-key.pem ubuntu@<BACKEND_SERVER_IP>
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@<PEER_02_IP>

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@<UAT_BASTION_IP>
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@<PEER_02_IP>

# SSH via bootstrap node
ssh -i ~/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP>
ssh -i /home/ipfs/.ssh/id_rsa ipfs@<PEER_02_IP>
```

#### Adding and Pinning Files
```bash
# SSH into peer-02
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP>

# Create test file
echo "Test file from Peer-02" > /tmp/test3.txt

# Add to IPFS
docker exec ipfs ipfs add /tmp/test3.txt
# Result: Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s

# Pin in cluster
docker exec ipfs-cluster ipfs-cluster-ctl pin add Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s

# Check pin status
docker exec ipfs-cluster ipfs-cluster-ctl pin ls
```

#### Retrieving Files
```bash
# Retrieve all test files
docker exec ipfs ipfs cat QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
docker exec ipfs ipfs cat QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
docker exec ipfs ipfs cat Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

## 4. Cluster Status Checks

### Bootstrap Node
```bash
# Check cluster status
ssh ipfs@<BOOTSTRAP_NODE_IP> "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh ipfs@<BOOTSTRAP_NODE_IP> "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh ipfs@<BOOTSTRAP_NODE_IP> "docker exec ipfs ipfs swarm peers"
```

### Peer-01
```bash
# Check cluster status
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "docker exec ipfs ipfs swarm peers"
```

### Peer-02
```bash
# Check cluster status
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "docker exec ipfs ipfs swarm peers"
```

## 5. Troubleshooting Commands

### Check Service Status
```bash
# Check IPFS service
ssh ipfs@<NODE_IP> "docker ps | grep ipfs"

# Check IPFS Cluster service
ssh ipfs@<NODE_IP> "docker ps | grep ipfs-cluster"

# Check service logs
ssh ipfs@<NODE_IP> "docker logs ipfs"
ssh ipfs@<NODE_IP> "docker logs ipfs-cluster"
```

### Check Network Connectivity
```bash
# Test port connectivity
ssh ipfs@<NODE_IP> "nc -zv <BOOTSTRAP_NODE_IP> 4001"  # Bootstrap node
ssh ipfs@<NODE_IP> "nc -zv <PEER_01_IP> 4001"    # Peer-01
ssh ipfs@<NODE_IP> "nc -zv <PEER_02_IP> 4001"    # Peer-02
```

### Check UFW Status
```bash
# Check UFW status on all nodes
ssh ipfs@<BOOTSTRAP_NODE_IP> "sudo ufw status verbose"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "sudo ufw status verbose"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "sudo ufw status verbose"
```

## 6. IP Whitelisting

### Current Whitelisted IPs for SSH Access

#### Infrastructure IPs
<<<<<<< HEAD
- **<BACKEND_SERVER_IP>** - bongaquino Staging Backend
- **<BOOTSTRAP_NODE_IP>** - Bootstrap Node
- **<PEER_01_IP>** - Peer-01
- **<PEER_02_IP>** - Peer-02
- **<UAT_BASTION_IP>** - bongaquino-UAT-Bastion
=======
- **<BACKEND_SERVER_IP>** - Staging Backend
- **<BOOTSTRAP_NODE_IP>** - Bootstrap Node
- **<PEER_01_IP>** - Peer-01
- **<PEER_02_IP>** - Peer-02
- **<UAT_BASTION_IP>** - UAT-Bastion
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

#### Team Member IPs
- **112.200.100.154** - Bong's IP
- **119.94.162.43** - Alex's IP
- **157.20.143.170** - Franz's IP
- **49.145.0.190** - Aldric's IP
- **112.198.104.175** - JB (IP changed due to new ISP - 2025-06-11)
- **64.224.110.64** - ASHER (Initial IP whitelist - 2025-06-11)

#### HostCenter Management IPs
- **110.10.81.170** - HostCenter Monitoring IP
- **121.125.68.226** - HostCenter Management IP

### Adding New IPs for SSH Access
```bash
# Add SSH access for new IP to all nodes
ssh -i ~/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP> "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"

# Reload UFW on all nodes
ssh -i ~/.ssh/id_rsa ipfs@<BOOTSTRAP_NODE_IP> "sudo ufw reload"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_01_IP> "sudo ufw reload"
ssh -i ~/.ssh/id_rsa ipfs@<PEER_02_IP> "sudo ufw reload"
```

## 7. Security Notes

### SSH Access Patterns
- **Bootstrap Node:** Public SSH access (anyone can connect)
- **Peer Nodes:** Restricted SSH access (whitelisted IPs only)
- **All Nodes:** Can SSH to each other for cluster management
- **Backend Server:** Can SSH to all nodes for monitoring
- **UAT Bastion:** Can SSH to all nodes for management

### Port Access Summary
- **SSH (22):** Varies by node (see access matrix above)
- **HTTP (80):** Bootstrap only (public), peers locked
- **HTTPS (443):** Bootstrap only (public), peers locked
- **IPFS API (5001):** Cluster nodes only
- **IPFS Gateway (8080):** Cluster nodes only
- **IPFS Cluster (9094-9096):** Cluster nodes only
- **IPFS Swarm (4001):** Cluster nodes only

## Notes
1. All commands are executed as the `ipfs` user
2. Docker containers must be running on each node
3. SSH key-based authentication is required for peer nodes
4. Port 4001 must be open for IPFS swarm communication
5. Port 9096 must be open for IPFS cluster communication
6. All nodes must be able to reach each other
7. External access is restricted to whitelisted IPs
8. Backend server (<BACKEND_SERVER_IP>) has special access to all nodes
9. UAT Bastion (<UAT_BASTION_IP>) has access to all nodes for management
10. Bootstrap node has public SSH access for web interface management 