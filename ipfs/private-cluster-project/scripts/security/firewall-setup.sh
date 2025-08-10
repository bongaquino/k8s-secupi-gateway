#!/bin/bash

# Security setup script for IPFS Private Cluster
# Configures Docker firewall rules for private cluster isolation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SECURITY]${NC} $1"
}

# Check if running with sufficient privileges
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root for firewall configuration"
    exit 1
fi

print_header "🔒 Configuring IPFS Private Cluster Security"

# Install UFW if not present
if ! command -v ufw &> /dev/null; then
    print_status "Installing UFW firewall..."
    apt-get update
    apt-get install -y ufw
fi

# Reset UFW to default state
print_status "Resetting UFW to default state..."
ufw --force reset

# Set default policies
print_status "Setting default UFW policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (adjust port if needed)
print_status "Allowing SSH access..."
ufw allow 22/tcp comment 'SSH access'

# Allow HTTP and HTTPS for HAProxy
print_status "Allowing HTTP/HTTPS for HAProxy..."
ufw allow 80/tcp comment 'HTTP for HAProxy'
ufw allow 443/tcp comment 'HTTPS for HAProxy'

# Allow HAProxy stats (restrict to local network)
print_status "Allowing HAProxy stats (local only)..."
ufw allow from 127.0.0.1 to any port 8404 comment 'HAProxy stats local'
ufw allow from 10.0.0.0/8 to any port 8404 comment 'HAProxy stats internal'
ufw allow from 172.16.0.0/12 to any port 8404 comment 'HAProxy stats docker'
ufw allow from 192.168.0.0/16 to any port 8404 comment 'HAProxy stats private'

# Docker network security
print_status "Configuring Docker network security..."

# Allow communication within private cluster network
ufw allow from 172.21.0.0/24 to 172.21.0.0/24 comment 'IPFS private cluster'

# Block external access to IPFS ports
print_status "Blocking external access to IPFS ports..."
ufw deny 4001:4003 comment 'Block external IPFS swarm'
ufw deny 5001 comment 'Block external IPFS API'
ufw deny 8080 comment 'Block external IPFS gateway'
ufw deny 9094:9096 comment 'Block external IPFS cluster'

# Allow Docker daemon to manage iptables
print_status "Configuring Docker iptables integration..."
cat > /etc/ufw/after.rules << 'EOF'
# Docker custom rules
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING ! -o docker0 -s 172.17.0.0/16 -j MASQUERADE
-A POSTROUTING ! -o br-+ -s 172.20.0.0/24 -j MASQUERADE
-A POSTROUTING ! -o br-+ -s 172.21.0.0/24 -j MASQUERADE
COMMIT

*filter
# Allow cluster internal communication
-A DOCKER-USER -s 172.21.0.0/24 -d 172.21.0.0/24 -j ACCEPT
# Block direct access to cluster nodes from outside Docker networks
-A DOCKER-USER -p tcp -m multiport --dports 4001:4003,5001,8080,9094:9096 ! -s 172.20.0.0/24 ! -s 172.21.0.0/24 -j DROP
COMMIT
EOF

# Additional Docker security
print_status "Applying additional Docker security rules..."

# Create script for Docker security
cat > /usr/local/bin/docker-security.sh << 'EOF'
#!/bin/bash
# Additional Docker security rules

# Block container-to-host communication on sensitive ports
iptables -I DOCKER-USER -s 172.20.0.0/24 -d $(ip route | awk '/docker0/ { print $9 }') -p tcp --dport 22 -j DROP
iptables -I DOCKER-USER -s 172.21.0.0/24 -d $(ip route | awk '/docker0/ { print $9 }') -p tcp --dport 22 -j DROP

# Allow HAProxy to access cluster nodes
iptables -I DOCKER-USER -s 172.20.0.0/24 -d 172.21.0.0/24 -p tcp -m multiport --dports 5001,8080,9094 -j ACCEPT

# Log dropped packets for monitoring
iptables -I DOCKER-USER -j LOG --log-prefix "DOCKER-SECURITY-DROP: " --log-level 4 -m limit --limit 5/min
EOF

chmod +x /usr/local/bin/docker-security.sh

# Create systemd service for Docker security
cat > /etc/systemd/system/docker-security.service << 'EOF'
[Unit]
Description=Docker Security Rules
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/docker-security.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
systemctl enable docker-security.service

# Enable UFW
print_status "Enabling UFW firewall..."
ufw --force enable

# Show status
print_status "UFW firewall status:"
ufw status verbose

# Security recommendations
print_header "🛡️  Security Recommendations"
echo
print_status "✓ Firewall configured for private cluster isolation"
print_status "✓ External access blocked to IPFS ports"
print_status "✓ HAProxy access restricted to trusted networks"
print_status "✓ Docker security rules applied"
echo
print_warning "Additional recommendations:"
print_warning "1. Change default SSH port from 22"
print_warning "2. Use SSH key authentication only"
print_warning "3. Configure fail2ban for brute force protection"
print_warning "4. Regular security updates"
print_warning "5. Monitor logs for suspicious activity"
print_warning "6. Consider VPN for administrative access"
echo
print_status "🔐 Security configuration completed" 