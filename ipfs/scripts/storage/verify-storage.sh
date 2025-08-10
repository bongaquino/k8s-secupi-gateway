#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying Storage Configuration...${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Check LVM configuration
echo -e "${YELLOW}Checking LVM Configuration:${NC}"
echo "Physical Volumes:"
pvs
echo -e "\nVolume Groups:"
vgs
echo -e "\nLogical Volumes:"
lvs
echo -e "\nLogical Volume Details:"
lvdisplay ipfs_vg/ipfs_lv

# Check filesystem
echo -e "\n${YELLOW}Checking XFS Filesystem:${NC}"
xfs_info /data/ipfs-storage

# Check mount options
echo -e "\n${YELLOW}Checking Mount Options:${NC}"
mount | grep ipfs-storage

# Check read-ahead settings
echo -e "\n${YELLOW}Checking Read-Ahead Settings:${NC}"
blockdev --getra /dev/mapper/ipfs_vg-ipfs_lv

# Check I/O scheduler
echo -e "\n${YELLOW}Checking I/O Scheduler:${NC}"
cat /sys/block/sd*/queue/scheduler

# Verify storage space
echo -e "\n${YELLOW}Checking Storage Space:${NC}"
df -h /data/ipfs-storage

echo -e "\n${GREEN}Storage verification complete!${NC}" 