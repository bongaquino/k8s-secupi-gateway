# Add HostCenter Monitoring and Management IPs to whitelist
echo "Adding HostCenter Monitoring and Management IPs to whitelist..."
for node in "${NODES[@]}"; do
    ssh "ipfs@${node}" "sudo ufw allow from 110.10.81.170 to any"
    ssh "ipfs@${node}" "sudo ufw allow from 121.125.68.226 to any"
done 