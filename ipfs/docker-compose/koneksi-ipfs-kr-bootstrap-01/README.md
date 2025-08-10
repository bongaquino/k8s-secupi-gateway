# IPFS Bootstrap Node 02 Configuration

## Server Details
- **IP Address:** 27.255.70.17
<<<<<<< HEAD
- **Username:** bongaquino01
=======
- **Username:** koneksi01
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
- **Password:** !Z2x3c*()
- **Node Type:** Bootstrap Node (Secondary)
- **Peername:** kr-bootstrap-02

## Purpose
This is a new isolated IPFS cluster bootstrap node that will create a completely separate cluster from the existing one. This node will not connect to the old cluster nodes (.217, .33, .34) and will serve as the foundation for a new cluster deployment.

## Pre-deployment Setup

### 1. Server Preparation
```bash
# SSH into the new server
<<<<<<< HEAD
ssh bongaquino01@27.255.70.17
=======
ssh koneksi01@27.255.70.17
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
# Password: !Z2x3c*()

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y docker.io docker-compose curl wget git ufw fail2ban

# Add user to docker group
<<<<<<< HEAD
sudo usermod -aG docker bongaquino01
=======
sudo usermod -aG docker koneksi01
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Log out and log back in for group changes to take effect
```

### 2. Security Configuration
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS for public access
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# IPFS cluster communication ports will be configured when new peer nodes are added
# For now, no cluster communication is needed as this is an isolated new cluster

# Allow backend server access
sudo ufw allow from 52.77.36.120 to any

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 3. Directory Setup
```bash
# Create IPFS directory structure
sudo mkdir -p /data/ipfs /data/ipfs-cluster
<<<<<<< HEAD
sudo chown -R bongaquino01:bongaquino01 /data/ipfs /data/ipfs-cluster

# Create project directory
mkdir -p /home/bongaquino01/bongaquino-ipfs/docker-compose
cd /home/bongaquino01/bongaquino-ipfs/docker-compose

# Copy configuration files (from your local machine)
scp -r bongaquino-ipfs-kr-bootstrap-02 bongaquino01@27.255.70.17:/home/bongaquino01/bongaquino-ipfs/docker-compose/
=======
sudo chown -R koneksi01:koneksi01 /data/ipfs /data/ipfs-cluster

# Create project directory
mkdir -p /home/koneksi01/koneksi-ipfs/docker-compose
cd /home/koneksi01/koneksi-ipfs/docker-compose

# Copy configuration files (from your local machine)
scp -r koneksi-ipfs-kr-bootstrap-02 koneksi01@27.255.70.17:/home/koneksi01/koneksi-ipfs/docker-compose/
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

## Deployment Steps

### 1. Deploy the Configuration
```bash
# Navigate to the configuration directory
<<<<<<< HEAD
cd /home/bongaquino01/bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02
=======
cd /home/koneksi01/koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

# Make scripts executable
chmod +x *.sh

# Start the services
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Verify Services
```bash
# Check IPFS status
docker exec ipfs ipfs id

# Check IPFS Cluster status
docker exec ipfs-cluster ipfs-cluster-ctl id

# Check cluster peers
docker exec ipfs-cluster ipfs-cluster-ctl peers ls
```

### 3. SSL Certificate Setup (Optional)
```bash
# If you want to use SSL certificates
./init-letsencrypt.sh
```

## New Cluster Deployment

### 1. Isolated Cluster Setup
This bootstrap node creates a completely new and isolated IPFS cluster that does not connect to the existing cluster (.217, .33, .34). This follows the same deployment process as the original cluster.

### 2. Adding New Peer Nodes
When you're ready to add peer nodes to this new cluster:
1. Deploy new peer nodes with configurations pointing to this bootstrap (27.255.70.17)
2. Update firewall rules to allow cluster communication between new nodes
3. Update the `disable-external-peers.sh` script to include new peer IDs
4. Ensure all new nodes use the same cluster secret

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Check service health
docker-compose ps

# Check logs
docker-compose logs -f ipfs
docker-compose logs -f ipfs-cluster

# Check cluster status
docker exec ipfs-cluster ipfs-cluster-ctl status
```

### 2. Pin Verification
```bash
# Run pin verification script
./verify-pins.sh

# Install as systemd service for automatic verification
sudo cp ipfs-pin-verify.service /etc/systemd/system/
sudo systemctl enable ipfs-pin-verify.service
sudo systemctl start ipfs-pin-verify.service
```

## Troubleshooting

### Common Issues
1. **Services not starting:** Check Docker logs and ensure ports are not in use
2. **Cluster connectivity issues:** Verify firewall rules and peer configurations
3. **SSL certificate issues:** Check domain DNS and certificate paths

### Useful Commands
```bash
# Restart services
docker-compose restart

# View service logs
docker-compose logs -f [service_name]

# Access container shell
docker exec -it ipfs sh
docker exec -it ipfs-cluster sh

# Check firewall status
sudo ufw status verbose
```

## Important Notes
- This creates a completely new and isolated IPFS cluster
- Uses the same cluster secret for consistency with deployment patterns
- The peername is set to "kr-bootstrap-02" for identification
- No connections to old cluster nodes (.217, .33, .34)
- Standard IPFS cluster ports are used for future peer additions
- Access controls are configured for security
- Ready for SSL certificate configuration when needed

## New Cluster Deployment Checklist
- [ ] Server preparation complete
- [ ] Security configuration applied
- [ ] Services deployed and running
- [ ] Bootstrap node verified as standalone
- [ ] SSL certificates configured (if needed)
- [ ] Ready for new peer node additions
- [ ] Firewall rules prepared for cluster expansion
- [ ] Monitoring and maintenance procedures in place 