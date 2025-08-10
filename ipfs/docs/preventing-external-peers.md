# Preventing External Peers in IPFS Cluster

## Overview
This document outlines the steps and configurations necessary to prevent external peers from connecting to your IPFS cluster. By implementing these measures, you can enhance the security and integrity of your cluster.

## Steps to Prevent External Peers

### 1. Configure UFW Firewall
- **Enable UFW**: Ensure that the Uncomplicated Firewall (UFW) is active on all nodes.
  ```bash
  sudo ufw enable
  ```
- **Allow SSH Access**: Allow SSH access on port 22 for administrative purposes.
  ```bash
  sudo ufw allow 22/tcp
  ```
- **Restrict IPFS Ports**: Allow incoming connections on IPFS ports (4001, 5001, 8080, 9094, 9096) only from known cluster peer IPs.
  ```bash
  sudo ufw allow from <peer_ip> to any port 4001,5001,8080,9094,9096 proto tcp
  ```
- **Block Other Traffic**: Set the default policy to deny all other incoming traffic.
  ```bash
  sudo ufw default deny incoming
  ```

### 2. Use SSH Key-Based Authentication
- **Generate SSH Keys**: Generate SSH key pairs on each node.
  ```bash
  ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa -N ''
  ```
- **Add Public Keys**: Add the public key of each node to the `authorized_keys` file of the other nodes to enable key-based authentication.
  ```bash
  cat ~/.ssh/id_rsa.pub | ssh <target_node> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
  ```
- **Disable Password Authentication**: Ensure that password authentication is disabled in the SSH configuration to prevent unauthorized access.
  ```bash
  sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  sudo systemctl restart sshd
  ```

### 3. Monitor and Verify
- **Regular Checks**: Regularly check the status of the peers using `ipfs-cluster-ctl peers ls` to ensure no external peers are connected.
  ```bash
  ipfs-cluster-ctl peers ls
  ```
- **Log Monitoring**: Monitor logs for any suspicious activities or unauthorized connection attempts.
  ```bash
  sudo tail -f /var/log/auth.log
  ```

## Additional Security Measures
- **Fail2ban**: Use `fail2ban` to automatically ban IPs that attempt to connect with incorrect credentials.
  ```bash
  sudo apt-get install fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```
- **Regular Updates**: Keep all software and dependencies up to date to protect against known vulnerabilities.
  ```bash
  sudo apt-get update && sudo apt-get upgrade
  ```

## Conclusion
By following these steps, you can effectively prevent external peers from connecting to your IPFS cluster, ensuring a secure and controlled environment for your data. 