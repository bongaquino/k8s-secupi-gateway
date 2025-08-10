# Proxmox Backup Access Configuration

## Server Details
- **Hostname:** proxmox.koneksi.co.kr
- **IP:** 211.239.117.217
- **Setup Date:** $(date)

## SSH Key-Based Access

### Primary Backup Access
```bash
# Connect using backup SSH key
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr
```

### SSH Key Details
- **Private Key:** `~/.ssh/proxmox_backup`
- **Public Key:** `~/.ssh/proxmox_backup.pub`
- **Key Type:** ED25519
- **Comment:** proxmox-backup-access

## Proxmox User Account

### Backup User
- **Username:** backup@pve
- **Email:** backup@koneksi.co.kr
- **Role:** Administrator
- **Comment:** Backup access user

### API Token
- **Token ID:** backup@pve!backup-token
- **Token Value:** 0fe81c50-d69f-4e33-b816-6b2c26b4fd92
- **Privilege Separation:** Disabled (privsep=0)

## Usage Examples

### SSH Access
```bash
# Test connection
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "pvesh get /version"

# Check cluster status
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "pvecm status"

# List VMs
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "qm list"
```

### API Access
```bash
# Using curl with API token
curl -k -H "Authorization: PVEAPIToken=backup@pve!backup-token=0fe81c50-d69f-4e33-b816-6b2c26b4fd92" \
  https://proxmox.koneksi.co.kr:8006/api2/json/version

# Get node status
curl -k -H "Authorization: PVEAPIToken=backup@pve!backup-token=0fe81c50-d69f-4e33-b816-6b2c26b4fd92" \
  https://proxmox.koneksi.co.kr:8006/api2/json/nodes
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
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "systemctl status pveproxy pvedaemon"

# Verify storage
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "pvesm status"

# Check VM states
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "qm list && pct list"
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
ssh -i ~/.ssh/proxmox_backup -v root@proxmox.koneksi.co.kr

# Check SSH key permissions
chmod 600 ~/.ssh/proxmox_backup
chmod 644 ~/.ssh/proxmox_backup.pub
```

### API Issues
```bash
# Test API connectivity
curl -k https://proxmox.koneksi.co.kr:8006/api2/json/version

# Verify token permissions
ssh -i ~/.ssh/proxmox_backup root@proxmox.koneksi.co.kr "pveum user token list backup@pve"
```
