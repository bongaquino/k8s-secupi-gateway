# PRIVATE IPFS CLUSTER - TECHNICAL OVERVIEW

## 🏗️ Architecture Summary

**Cluster Type:** Private IPFS Cluster with Swarm Key Isolation  
**Geographic Location:** South Korea  
**Total Nodes:** 4 (1 Bootstrap + 3 Peers)  
**Network Security:** 3-Layer Firewall + Private Swarm Key  

## 📍 Node Distribution

| Role | IP Address | Hostname | Storage | Purpose |
|------|------------|----------|---------|---------|
| Bootstrap | `<BOOTSTRAP_IP>` | kr-bootstrap-01 | Standard | Primary Gateway & API |
| Peer-01 | `<PEER_01_IP>` | kr-peer-01 | 14.6TB XFS | Storage Node |
| Peer-02 | `<PEER_02_IP>` | kr-peer-02 | 125TB RAID-6 | High-Capacity Storage |
| Peer-03 | `<PEER_03_IP>` | kr-peer-03 | Standard | Storage Node |

## 🔗 Public Endpoints

- **IPFS API:** `https://ipfs.example.com` (Port 5001)
- **IPFS Gateway:** `https://gateway.example.com` (Port 8080)
- **DNS Provider:** AWS Route53
- **SSL/TLS:** Wildcard Certificate (`*.example.com`)

## 🔐 Security Features

### Network Isolation
- ✅ **Private Swarm Key** - Blocks all external IPFS connections
- ✅ **Zero Public Network Access** - No Cloudflare or unknown IPs
- ✅ **3-Layer Firewall Protection:**
  - UFW (OS-level firewall)
  - UFW-Docker (Container-specific rules)
  - Nginx IP Whitelist (Application-level filtering)

### Access Control
- ✅ **SSH:** Key-based authentication only (Password disabled)
- ✅ **Root Access:** Disabled on all nodes
- ✅ **IP Whitelisting:** Team members + Infrastructure IPs only

## 🌍 Network Topology

```
Internet → AWS Route53 → Bootstrap Node (<BOOTSTRAP_IP>)
                       ↓
                    Nginx (SSL Termination + IP Filter)
                       ↓
                    IPFS API/Gateway
                       ↓
              Private IPFS Cluster Network
                 ↓         ↓         ↓
           Peer-01    Peer-02    Peer-03
          (.33)       (.34)       (.217)
```

## 🔧 Technical Specifications

- **Container Platform:** Docker + Docker Compose
- **IPFS Version:** kubo:latest (Official IPFS implementation)
- **Cluster Version:** ipfs/ipfs-cluster:latest
- **Web Server:** Nginx Alpine (SSL termination & reverse proxy)
- **Storage Backend:** Direct filesystem mounting (/data volumes)
- **Backup Strategy:** Distributed replication across 4 nodes

## 📊 Communication Ports

| Service | Port | Purpose |
|---------|------|---------|
| IPFS P2P | 4001/tcp | Node-to-node IPFS communication |
| IPFS API | 5001/tcp | API access |
| IPFS Gateway | 8080/tcp | HTTP Gateway |
| Cluster API | 9094/tcp | Cluster management |
| Cluster Proxy | 9095/tcp | Cluster proxy |
| Cluster Swarm | 9096/tcp | Cluster P2P communication |

## 🏢 Integration Points

- **Backend Integration:** AWS ECS → IPFS API (`https://ipfs.bongaquino.co.kr`)
- **Frontend Access:** AWS Amplify → IPFS Gateway (`https://gateway.bongaquino.co.kr`)
- **Load Balancer:** AWS ALB → ECS → IPFS Cluster
- **NAT Gateway IP:** `13.250.68.194` (Whitelisted for backend access)

## 🧪 Testing & Verification Commands

### Cluster Status Check
```bash
ssh ipfs@<BOOTSTRAP_IP> "docker exec ipfs-cluster ipfs-cluster-ctl peers ls"
```

### Security Verification
```bash
ssh ipfs@<BOOTSTRAP_IP> "docker exec ipfs ipfs swarm peers"
# Should show exactly 3 internal peers only
```

### Storage Check
```bash
ssh ipfs@<BOOTSTRAP_IP> "df -h /data"
```

### API Test
```bash
curl -X POST -F file=@testfile.txt https://ipfs.example.com/api/v0/add
```

### Gateway Test
```bash
curl https://gateway.example.com/ipfs/<CID>
```

## 📋 Authorized Access List

### Team Members
- **Bong (Admin):** `112.200.104.154`
- **Alex (DevOps):** `119.94.172.143`
- **Franz (Developer):** `157.20.143.170`, `157.20.143.172`, `157.20.143.171`
- **Drew (Developer):** `112.205.173.97`
- **JB (Developer):** `103.125.151.254`
- **Rafa (Developer):** `65.93.75.199`
- **Karl (Developer):** `119.92.3.131`

### Infrastructure IPs
- **Backend Server:** `52.77.36.120`
- **UAT Bastion:** `18.139.136.149`
- **ECS NAT Gateway:** `13.250.68.194`
- **ALB IPs:** `54.254.84.88`, `13.228.96.207`

## 🎯 Management Commands

### SSH Access
```bash
ssh ipfs@<BOOTSTRAP_IP>     # Bootstrap node
ssh ipfs@<PEER_03_IP>  # Peer-03
ssh ipfs@<PEER_01_IP>    # Peer-01
ssh ipfs@<PEER_02_IP>    # Peer-02
```

### Key Monitoring Commands
```bash
# Cluster peer status
docker exec ipfs-cluster ipfs-cluster-ctl peers ls

# IPFS swarm peers (security check)
docker exec ipfs ipfs swarm peers

# Pinned content list
docker exec ipfs-cluster ipfs-cluster-ctl pin ls

# Content status check
docker exec ipfs-cluster ipfs-cluster-ctl status <CID>

# Container health
docker ps
```

## ✅ Production Readiness Checklist

- ✅ **Private Network Isolation:** Verified (3 internal peers only)
- ✅ **Inter-node Communication:** Established across all 4 nodes
- ✅ **SSL/TLS Certificates:** Configured and valid
- ✅ **Firewall Rules:** Optimized for security and functionality
- ✅ **Storage Systems:** Mounted and accessible on all nodes
- ✅ **API Endpoints:** Responding correctly
- ✅ **Content Replication:** Working across cluster
- ✅ **Security Hardening:** Complete (SSH, firewall, network isolation)

## 🎉 Deployment Status: PRODUCTION READY

The IPFS cluster is fully operational, secure, and ready for production workloads. All security measures are in place, and the cluster provides high availability through distributed storage across 4 geographically co-located nodes.

---

**For Live Demonstration:** Run `./ipfs-cluster-presentation.sh` to see real-time cluster status and comprehensive technical details. 