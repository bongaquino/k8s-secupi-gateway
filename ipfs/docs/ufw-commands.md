# UFW (Uncomplicated Firewall) Commands

## Current Cluster Configuration

### Node Information
- **Bootstrap Node:** <BOOTSTRAP_NODE_IP>
- **Peer-01:** <PEER_01_IP>
- **Peer-02:** <PEER_02_IP>
- **Backend Server:** <BACKEND_SERVER_IP> (Staging Backend)
- **UAT Bastion:** <UAT_BASTION_IP> (UAT-Bastion)

## Basic Commands

### Check UFW Status
```bash
sudo ufw status
sudo ufw status verbose
sudo ufw status numbered
```

### Enable/Disable UFW
```bash
# Enable UFW
sudo ufw enable

# Disable UFW
sudo ufw disable
```

## Current SSH Access Configuration

### Bootstrap Node (<BOOTSTRAP_NODE_IP>)
```bash
# SSH Access Rules
sudo ufw allow 22/tcp                    # Public SSH access
sudo ufw allow from <PEER_01_IP> to any port 22  # Peer-01
sudo ufw allow from <PEER_02_IP> to any port 22  # Peer-02
sudo ufw allow from <BACKEND_SERVER_IP> to any port 22   # Staging Backend
sudo ufw allow from <UAT_BASTION_IP> to any port 22 comment 'UAT-Bastion'
```

### Peer-01 (<PEER_01_IP>)
```bash
# SSH Access Rules
sudo ufw allow from <ADMIN_IP> to any port 22  # Admin IP
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any port 22  # Bootstrap Node
sudo ufw allow from <PEER_02_IP> to any port 22    # Peer-02
sudo ufw allow from <BACKEND_SERVER_IP> to any port 22     # Staging Backend
sudo ufw allow from <UAT_BASTION_IP> to any port 22 comment 'UAT-Bastion'
```

### Peer-02 (<PEER_02_IP>)
```bash
# SSH Access Rules
sudo ufw allow from <ADMIN_IP> to any port 22  # Admin IP
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any port 22  # Bootstrap Node
sudo ufw allow from <PEER_01_IP> to any port 22    # Peer-01
sudo ufw allow from <BACKEND_SERVER_IP> to any port 22     # Staging Backend
sudo ufw allow from <UAT_BASTION_IP> to any port 22 comment 'UAT-Bastion'
```

## Current Port Access Configuration

### Bootstrap Node (<BOOTSTRAP_NODE_IP>)
```bash
# Public Access
sudo ufw allow 80/tcp   # HTTP - Public access
sudo ufw allow 443/tcp  # HTTPS - Public access

# Cluster Ports (5001, 8080) - Restricted Access
sudo ufw allow from <BACKEND_SERVER_IP> to any port 5001,8080/tcp  # Backend Server
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any port 5001,8080/tcp  # Self
sudo ufw allow from <PEER_01_IP> to any port 5001,8080/tcp  # Peer-01
sudo ufw allow from <PEER_02_IP> to any port 5001,8080/tcp  # Peer-02

# IPFS Cluster Ports (9094-9096, 4001) - Cluster Only
sudo ufw allow from <PEER_01_IP> to any port 9094,9095,9096,4001  # Peer-01
sudo ufw allow from <PEER_02_IP> to any port 9094,9095,9096,4001  # Peer-02
```

### Peer Nodes (<PEER_01_IP> & <PEER_02_IP>)
```bash
# HTTP/HTTPS - LOCKED (No public access)
# Ports 80 and 443 are not allowed from any external IP

# Cluster Ports (5001, 8080) - Cluster Only
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any port 5001,8080  # Bootstrap Node
sudo ufw allow from <OTHER_PEER_IP> to any port 5001,8080        # Other Peer

# IPFS Cluster Ports (9094-9096, 4001) - Cluster Only
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any port 9094,9095,9096,4001  # Bootstrap Node
sudo ufw allow from <OTHER_PEER_IP> to any port 9094,9095,9096,4001        # Other Peer
```

## Whitelisted IPs for General Access

### Hosting Provider Management
```bash
sudo ufw allow from <HOSTING_MONITORING_IP> to any  # Hosting Provider Monitoring IP
sudo ufw allow from <HOSTING_MANAGEMENT_IP> to any  # Hosting Provider Management IP
```

### Team Member IPs
```bash
sudo ufw allow from <ADMIN_IP> to any  # Admin IP
sudo ufw allow from <TEAM_MEMBER_1_IP> to any    # Team Member 1 IP
sudo ufw allow from <TEAM_MEMBER_2_IP> to any   # Team Member 2 IP
sudo ufw allow from <TEAM_MEMBER_3_IP> to any     # Team Member 3 IP
sudo ufw allow from <TEAM_MEMBER_4_IP> to any  # Team Member 4 IP
sudo ufw allow from <TEAM_MEMBER_5_IP> to any    # Team Member 5 IP
```

### Infrastructure IPs
```bash
sudo ufw allow from <BACKEND_SERVER_IP> to any     # Staging Backend
sudo ufw allow from <BOOTSTRAP_NODE_IP> to any  # Bootstrap Node
sudo ufw allow from <PEER_01_IP> to any    # Peer-01
sudo ufw allow from <PEER_02_IP> to any    # Peer-02
sudo ufw allow from <UAT_BASTION_IP> to any   # UAT-Bastion
```

## Security Configuration Summary

### Bootstrap Node (<BOOTSTRAP_NODE_IP>)
- ✅ **SSH:** Public access + cluster nodes + backend + UAT bastion
- ✅ **HTTP/HTTPS:** Public access for web interface
- ✅ **Ports 5001/8080:** Only cluster nodes and backend
- ✅ **Cluster Ports:** Only peer nodes
- ✅ **Default Policy:** Deny incoming, allow outgoing

### Peer Nodes (<PEER_01_IP> & <PEER_02_IP>)
- ✅ **SSH:** Only whitelisted IPs + cluster nodes + backend + UAT bastion
- 🔒 **HTTP/HTTPS:** Completely locked - no public access
- 🔒 **Ports 5001/8080:** Only cluster nodes
- ✅ **Cluster Ports:** Only cluster nodes
- ✅ **Default Policy:** Deny incoming, allow outgoing

## Managing Rules

### Allow SSH (Port 22)
```bash
# Allow SSH from anywhere
sudo ufw allow 22/tcp

# Allow SSH from specific IP
sudo ufw allow from <SPECIFIC_IP> to any port 22

# Allow SSH with comment
sudo ufw allow from <UAT_BASTION_IP> to any port 22 comment 'UAT-Bastion'
```

### Allow HTTP/HTTPS
```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp
```

### Allow Specific Ports
```bash
# Allow specific port
sudo ufw allow 8080/tcp

# Allow port range
sudo ufw allow 8000:8080/tcp
```

### Allow Specific IP Addresses
```bash
# Allow all traffic from specific IP
sudo ufw allow from <SPECIFIC_IP>

# Allow specific port from specific IP
sudo ufw allow from <SPECIFIC_IP> to any port 3306
```

## Removing Rules

### Remove Rules by Number
```bash
# List rules with numbers
sudo ufw status numbered

# Remove rule by number
sudo ufw delete 1
```

### Remove Rules by Specification
```bash
# Remove allow rule for port 22
sudo ufw delete allow 22/tcp

# Remove allow rule for specific IP
sudo ufw delete allow from <SPECIFIC_IP>

# Remove IPFS cluster rule
sudo ufw delete allow from <PEER_IP> to any port 4001,5001,8080,9094,9096 proto tcp
```

## Advanced Rules

### Deny Rules
```bash
# Deny specific port
sudo ufw deny 8080/tcp

# Deny specific IP
sudo ufw deny from 192.168.1.100
```

### Limit Rules (Prevent Brute Force)
```bash
# Limit SSH connections
sudo ufw limit 22/tcp
```

### Logging
```bash
# Enable logging
sudo ufw logging on

# Disable logging
sudo ufw logging off
```

## Best Practices

1. **Always allow SSH first** before enabling UFW
2. **Use specific IP addresses** when possible instead of allowing from anywhere
3. **Use limit rules** for services like SSH to prevent brute force attacks
4. **Check status** after making changes
5. **Test connectivity** after applying new rules
6. **Document all rules** with comments for easy management
7. **Keep a backup** of your rules before making changes
8. **Use the update script** for IP changes to maintain consistency
9. **Include timestamps** in rule comments for tracking changes
10. **Use descriptive comments** to explain the purpose of each rule

## Example Workflow

1. Enable UFW:
   ```bash
   sudo ufw enable
   ```

2. Allow SSH:
   ```bash
   sudo ufw allow 22/tcp
   ```

3. Allow IPFS Cluster Ports:
   ```bash
   sudo ufw allow from <peer_ip> to any port 4001,5001,8080,9094,9096 proto tcp
   ```

4. Check status:
   ```bash
   sudo ufw status
   ```

5. If you need to remove a rule:
   ```bash
   sudo ufw status numbered
   sudo ufw delete <rule_number>
   ```

## Troubleshooting

If you get locked out:
1. Connect to the server through the cloud provider's console
2. Disable UFW:
   ```bash
   sudo ufw disable
   ```
3. Fix your rules
4. Re-enable UFW:
   ```bash
   sudo ufw enable
   ```

## Notes

- Rules are applied in order
- Later rules take precedence over earlier ones
- Default policies can be set for incoming/outgoing traffic
- Always test rules before applying them in production
- Keep a backup of your rules:
  ```bash
  sudo ufw status > ufw-rules-backup.txt
  ```
- For IPFS cluster, ensure all required ports (4001, 5001, 8080, 9094, 9096) are open between nodes
- Use comments to document the purpose of each rule
- Use the update script for IP changes to maintain consistency across all nodes
- **Current Security Status:** All nodes are properly secured with SSH access for management and cluster ports locked to cluster nodes only 