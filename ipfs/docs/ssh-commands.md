# SSH Commands Used in IPFS Cluster Testing

## Current SSH Access Configuration (Updated: 2025-01-27)

### Node Information
- **Bootstrap Node:** 211.239.117.217
- **Peer-01:** 218.38.136.33
- **Peer-02:** 218.38.136.34
- **Backend Server:** 52.77.36.120 (Koneksi Staging Backend)
- **UAT Bastion:** 18.139.136.149 (Koneksi-UAT-Bastion)

## SSH Access Matrix

### Bootstrap Node (211.239.117.217)
- ✅ **Public SSH Access:** Open to all (Anywhere)
- ✅ **Peer-01:** 218.38.136.33
- ✅ **Peer-02:** 218.38.136.34
- ✅ **Backend Server:** 52.77.36.120
- ✅ **UAT Bastion:** 18.139.136.149

### Peer-01 (218.38.136.33)
- ✅ **Bong's IP:** 112.200.100.154
- ✅ **Bootstrap Node:** 211.239.117.217
- ✅ **Peer-02:** 218.38.136.34
- ✅ **Backend Server:** 52.77.36.120
- ✅ **UAT Bastion:** 18.139.136.149

### Peer-02 (218.38.136.34)
- ✅ **Bong's IP:** 112.200.100.154
- ✅ **Bootstrap Node:** 211.239.117.217
- ✅ **Peer-01:** 218.38.136.33
- ✅ **Backend Server:** 52.77.36.120
- ✅ **UAT Bastion:** 18.139.136.149

## SSH Commands by Node

### 1. Bootstrap Node (211.239.117.217)

#### SSH Access
```bash
# Direct SSH access (from any IP)
ssh ipfs@211.239.117.217

# SSH via backend server
ssh -i ~/.ssh/koneksi-ipfs-backend.pem ubuntu@52.77.36.120
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@211.239.117.217

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@18.139.136.149
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@211.239.117.217
```

#### Adding and Pinning Files
```bash
# SSH into bootstrap node
ssh ipfs@211.239.117.217

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

### 2. Peer-01 (218.38.136.33)

#### SSH Access
```bash
# Direct SSH access (from whitelisted IPs only)
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33

# SSH via backend server
ssh -i ~/.ssh/koneksi-ipfs-backend.pem ubuntu@52.77.36.120
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@218.38.136.33

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@18.139.136.149
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@218.38.136.33

# SSH via bootstrap node
ssh -i ~/.ssh/id_rsa ipfs@211.239.117.217
ssh -i /home/ipfs/.ssh/id_rsa ipfs@218.38.136.33
```

#### Adding and Pinning Files
```bash
# SSH into peer-01
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33

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

### 3. Peer-02 (218.38.136.34)

#### SSH Access
```bash
# Direct SSH access (from whitelisted IPs only)
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34

# SSH via backend server
ssh -i ~/.ssh/koneksi-ipfs-backend.pem ubuntu@52.77.36.120
ssh -i /home/ubuntu/.ssh/id_rsa_backend ipfs@218.38.136.34

# SSH via UAT bastion
ssh -i ~/.ssh/id_rsa ipfs@18.139.136.149
ssh -i /home/ubuntu/.ssh/id_rsa ipfs@218.38.136.34

# SSH via bootstrap node
ssh -i ~/.ssh/id_rsa ipfs@211.239.117.217
ssh -i /home/ipfs/.ssh/id_rsa ipfs@218.38.136.34
```

#### Adding and Pinning Files
```bash
# SSH into peer-02
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34

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
ssh ipfs@211.239.117.217 "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh ipfs@211.239.117.217 "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh ipfs@211.239.117.217 "docker exec ipfs ipfs swarm peers"
```

### Peer-01
```bash
# Check cluster status
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "docker exec ipfs ipfs swarm peers"
```

### Peer-02
```bash
# Check cluster status
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "docker exec ipfs-cluster ipfs-cluster-ctl status"

# Check peer connections
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"

# Check swarm connections
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "docker exec ipfs ipfs swarm peers"
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
ssh ipfs@<NODE_IP> "nc -zv 211.239.117.217 4001"  # Bootstrap node
ssh ipfs@<NODE_IP> "nc -zv 218.38.136.33 4001"    # Peer-01
ssh ipfs@<NODE_IP> "nc -zv 218.38.136.34 4001"    # Peer-02
```

### Check UFW Status
```bash
# Check UFW status on all nodes
ssh ipfs@211.239.117.217 "sudo ufw status verbose"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "sudo ufw status verbose"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "sudo ufw status verbose"
```

## 6. IP Whitelisting

### Current Whitelisted IPs for SSH Access

#### Infrastructure IPs
- **52.77.36.120** - Koneksi Staging Backend
- **211.239.117.217** - Bootstrap Node
- **218.38.136.33** - Peer-01
- **218.38.136.34** - Peer-02
- **18.139.136.149** - Koneksi-UAT-Bastion

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
ssh -i ~/.ssh/id_rsa ipfs@211.239.117.217 "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "sudo ufw allow from <NEW_IP> to any port 22 comment 'New User Access'"

# Reload UFW on all nodes
ssh -i ~/.ssh/id_rsa ipfs@211.239.117.217 "sudo ufw reload"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.33 "sudo ufw reload"
ssh -i ~/.ssh/id_rsa ipfs@218.38.136.34 "sudo ufw reload"
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
8. Backend server (52.77.36.120) has special access to all nodes
9. UAT Bastion (18.139.136.149) has access to all nodes for management
10. Bootstrap node has public SSH access for web interface management 