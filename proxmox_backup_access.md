# Proxmox Backup Access Configuration

## Server Details
- **Hostname:** <PROXMOX_HOSTNAME>
- **IP:** <PROXMOX_SERVER_IP>
- **Setup Date:** $(date)

## SSH Key-Based Access

### Primary Backup Access
```bash
# Connect using backup SSH key
ssh -i ~/.ssh/proxmox_backup root@<PROXMOX_HOSTNAME>
```

### SSH Key Details
- **Private Key:** `~/.ssh/proxmox_backup`
- **Public Key:** `~/.ssh/proxmox_backup.pub`
- **Key Type:** ED25519
- **Comment:** proxmox-backup-access

## Proxmox User Account

### Backup User
- **Username:** backup@pve
- **Email:** backup@example.com
- **Role:** Administrator
- **Comment:** Backup access user

### API Token
- **Token ID:** backup@pve!backup-token
- **Token Value:** <API_TOKEN_VALUE>
- **Privilege Separation:** Disabled (privsep=0)

## Usage Examples

### SSH Access
```bash
# Test connection
ssh -i ~/.ssh/proxmox_backup root@<PROXMOX_HOSTNAME> "pvesh get /version"

# Check cluster status
ssh -i ~/.ssh/proxmox_backup root@<PROXMOX_HOSTNAME> "pvecm status"

# List VMs
ssh -i ~/.ssh/proxmox_backup root@<PROXMOX_HOSTNAME> "qm list"
```

### API Access
```bash
# Using curl with API token
curl -k -H "Authorization: PVEAPIToken=backup@pve!backup-token=<API_TOKEN_VALUE>" \
  https://<PROXMOX_HOSTNAME>:8006/api2/json/version

# Get node status
curl -k -H "Authorization: PVEAPIToken=backup@pve!backup-token=<API_TOKEN_VALUE>" \
  https://<PROXMOX_HOSTNAME>:8006/api2/json/nodes
```

## Recovery Procedures

### Emergency Access Methods
1. **SSH Key Access** - Primary method using the backup key
2. **Console Access** - Physical or virtual console through hosting provider
3. **API Token** - For automated scripts and monitoring
4. **Root Password Reset** - Through hosting provider console if needed

### Backup Verification Commands
```bash
# Check system status
ssh -i ~/.ssh/proxmox_backup root@proxmox.bongaquino.co.kr "systemctl status pveproxy pvedaemon"

# Verify storage
ssh -i ~/.ssh/proxmox_backup root@proxmox.bongaquino.co.kr "pvesm status"

# Check VM states
ssh -i ~/.ssh/proxmox_backup root@proxmox.bongaquino.co.kr "qm list && pct list"
```

## Security Notes

- Keep the private key secure and backed up
- Monitor access logs regularly
- Rotate API tokens periodically
- Use principle of least privilege for additional users
- Enable two-factor authentication where possible

## Troubleshooting

### SSH Issues
```bash
# Verbose SSH connection for debugging
ssh -i ~/.ssh/proxmox_backup -v root@proxmox.bongaquino.co.kr

# Check SSH key permissions
chmod 600 ~/.ssh/proxmox_backup
chmod 644 ~/.ssh/proxmox_backup.pub
```

### API Issues
```bash
# Test API connectivity
curl -k https://proxmox.bongaquino.co.kr:8006/api2/json/version

# Verify token permissions
ssh -i ~/.ssh/proxmox_backup root@proxmox.bongaquino.co.kr "pveum user token list backup@pve"
```
