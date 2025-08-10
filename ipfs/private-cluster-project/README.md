# IPFS Private Cluster Project

## Overview

This project provides a complete **IPFS private cluster deployment** with **HAProxy load balancer** architecture. The setup includes:

- **Public Subnet**: HAProxy load balancer with SSL termination
- **Private Subnet**: 3-node IPFS cluster (isolated from public networks)
- **Security**: Firewall rules, network isolation, and access controls
- **High Availability**: Load balancing, health checks, and failover

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Subnet (172.20.0.0/24)            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 HAProxy Load Balancer               │    │
│  │              (SSL Termination)                      │    │
│  │         Ports: 80, 443, 8404                        │    │
│  └─────────────────────┬───────────────────────────────┘    │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                 Private Subnet (172.21.0.0/24)              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   IPFS Node 01  │  │   IPFS Node 02  │  │ IPFS Node 03 │ │
│  │  172.21.0.10    │  │  172.21.0.11    │  │ 172.21.0.12  │ │
│  │  (Bootstrap)    │  │  (Peer)         │  │ (Peer)       │ │
│  │                 │  │                 │  │              │ │
│  │ IPFS: 5001,8080 │  │ IPFS: 5001,8080 │  │IPFS:5001,8080│ │
│  │ Cluster: 9094-6 │  │ Cluster: 9094-6 │  │Cluster:9094-6│ │
│  │ Swarm: 4001     │  │ Swarm: 4001     │  │Swarm: 4001   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 🔒 **Security**
- Network isolation between public and private subnets
- Firewall rules blocking direct access to IPFS nodes
- Private swarm key for IPFS network isolation
- HAProxy access controls and rate limiting

### ⚡ **Performance**
- Load balancing across 3 IPFS nodes
- Health checks and automatic failover
- Optimized IPFS server profiles
- Connection pooling and keep-alive

### 🛡️ **High Availability**
- Multi-node cluster with replication
- Automatic peer discovery and recovery
- Graceful degradation on node failure
- Persistent data storage

### 📊 **Monitoring**
- HAProxy statistics dashboard
- Cluster health monitoring
- IPFS swarm connectivity tracking
- Automated testing scripts

## Quick Start

### Prerequisites

- **Docker & Docker Compose** installed
- **curl, jq** for testing
- **sudo access** for firewall configuration
- **4GB+ RAM** recommended

### 1. Deploy the Cluster

```bash
# Navigate to project directory
<<<<<<< HEAD
cd bongaquino-ipfs/private-cluster-project
=======
cd koneksi-ipfs/private-cluster-project
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Make deployment script executable
chmod +x scripts/deployment/deploy-all.sh

# Deploy everything
./scripts/deployment/deploy-all.sh
```

### 2. Verify Deployment

```bash
# Test cluster connectivity
./scripts/network/test-cluster.sh

# Check HAProxy stats
curl http://localhost:8404/stats

# Test IPFS API
curl http://localhost/api/v0/version
```

### 3. Security Setup (Optional)

```bash
# Configure firewall (run as root)
sudo ./scripts/security/firewall-setup.sh
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **IPFS API** | `http://localhost/api/v0/` | IPFS HTTP API |
| **IPFS Gateway** | `http://localhost/ipfs/` | IPFS content gateway |
| **Cluster API** | `http://localhost/cluster/` | IPFS Cluster API |
| **HAProxy Stats** | `http://localhost:8404/stats` | Load balancer statistics |

## Management Commands

### Cluster Operations

```bash
# Check cluster status
docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls

# Add content to cluster
docker exec ipfs-cluster-private-01 ipfs-cluster-ctl add /path/to/file

# List pinned content
docker exec ipfs-cluster-private-01 ipfs-cluster-ctl pin ls

# Check pin status
docker exec ipfs-cluster-private-01 ipfs-cluster-ctl status <CID>
```

### IPFS Operations

```bash
# Check IPFS node status
docker exec ipfs-private-01 ipfs id

# View swarm connections
docker exec ipfs-private-01 ipfs swarm peers

# Add content directly to IPFS
docker exec ipfs-private-01 ipfs add /path/to/file

# Retrieve content
docker exec ipfs-private-01 ipfs cat <CID>
```

### Container Management

```bash
# View logs
docker-compose logs -f ipfs-cluster-private-01

# Restart a node
cd docker-compose/ipfs-cluster-private-01
docker-compose restart

# Scale up/down
docker-compose up -d --scale ipfs-cluster=2
```

## Configuration

### HAProxy Configuration

- **File**: `docker-compose/haproxy-public/haproxy.cfg`
- **Load Balancing**: Round-robin across IPFS nodes
- **Health Checks**: Automatic backend health monitoring
- **SSL**: Let's Encrypt integration for HTTPS

### IPFS Cluster Configuration

- **Consensus**: CRDT (Conflict-free Replicated Data Type)
- **Replication**: Min 2, Max 3 nodes
- **Secret**: Shared cluster authentication key
- **Network**: Private subnet isolation

### IPFS Node Configuration

- **Profile**: Server (optimized for performance)
- **Swarm Key**: Private network isolation
- **Discovery**: Disabled for security
- **Bootstrap**: Custom cluster-only peers

## Troubleshooting

### Common Issues

1. **Cluster peers not connecting**
   ```bash
   # Check network connectivity
   docker exec ipfs-cluster-private-01 ipfs-cluster-ctl peers ls
   
   # Restart cluster services
   cd docker-compose/ipfs-cluster-private-01
   docker-compose restart ipfs-cluster
   ```

2. **HAProxy returning 503 errors**
   ```bash
   # Check backend health
   curl http://localhost:8404/stats
   
   # Verify IPFS nodes are responding
   docker exec ipfs-private-01 ipfs version
   ```

3. **Content not replicating**
   ```bash
   # Check cluster status
   docker exec ipfs-cluster-private-01 ipfs-cluster-ctl status <CID>
   
   # Force pin recovery
   docker exec ipfs-cluster-private-01 ipfs-cluster-ctl recover <CID>
   ```

### Log Locations

```bash
# Cluster logs
docker logs ipfs-cluster-private-01

# IPFS logs  
docker logs ipfs-private-01

# HAProxy logs
docker logs haproxy-public
```

## Maintenance

### Regular Tasks

1. **Monitor cluster health**
   ```bash
   ./scripts/network/test-cluster.sh
   ```

2. **Update containers**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. **Backup cluster data**
   ```bash
   rsync -av /data/ipfs-cluster-private-* /backup/
   ```

4. **Check resource usage**
   ```bash
   docker stats
   ```

### Security Updates

1. **Firewall rules review**
2. **Container image updates**
3. **SSL certificate renewal**
4. **Access log monitoring**

## Stopping and Cleanup

### Stop Services

```bash
# Stop all services
./scripts/deployment/stop-all.sh

# Stop individual components
cd docker-compose/ipfs-cluster-private-01
docker-compose down
```

### Complete Cleanup

```bash
# Remove everything (WARNING: destroys all data)
./scripts/deployment/cleanup.sh
```

## Advanced Configuration

### Custom Networks

Edit `docker-compose/haproxy-public/docker-compose.yml` to modify network subnets:

```yaml
networks:
  public_network:
    ipam:
      config:
        - subnet: 172.20.0.0/24
  private_network:
    ipam:
      config:
        - subnet: 172.21.0.0/24
```

### Resource Limits

Add resource constraints to service definitions:

```yaml
services:
  ipfs:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

### SSL Certificates

1. **Let's Encrypt** (automatic):
   - Configure domains in HAProxy
   - Certificates auto-renew

2. **Custom certificates**:
   - Place files in `docker-compose/haproxy-public/ssl/`
   - Update HAProxy configuration

## Directory Structure

```
private-cluster-project/
├── docker-compose/
│   ├── haproxy-public/          # Load balancer (public subnet)
│   ├── ipfs-cluster-private-01/ # Bootstrap node
│   ├── ipfs-cluster-private-02/ # Peer node 2  
│   └── ipfs-cluster-private-03/ # Peer node 3
├── scripts/
│   ├── deployment/              # Deploy, stop, cleanup scripts
│   ├── network/                 # Network testing scripts
│   └── security/               # Security configuration
├── docs/                       # Additional documentation
├── configs/                    # Configuration templates
└── README.md                   # This file
```

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review container logs
3. Run network connectivity tests
4. Check firewall configuration

## License

<<<<<<< HEAD
This project is part of the bongaquino IPFS infrastructure.
=======
This project is part of the Koneksi IPFS infrastructure.
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

---

**⚠️ Important**: This is a production-ready setup for private IPFS clusters. Ensure proper security measures are in place before deploying to production environments. 