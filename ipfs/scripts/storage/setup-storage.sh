#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root"
        exit 1
    fi
}

# Function to check for required commands
check_requirements() {
    local required_commands=("mdadm" "lvm" "lsblk" "blkid")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_status "Required command '$cmd' not found. Installing..."
            apt-get update
            apt-get install -y mdadm lvm2
        fi
    done
}

# Function to identify SAS drives
identify_sas_drives() {
    print_status "Identifying SAS drives..."
    local drives=()
    
    # Check for 12 SAS drives
    for i in {a..l}; do
        if [ -e "/dev/sd$i" ]; then
            drives+=("/dev/sd$i")
        fi
    done
    
    if [ ${#drives[@]} -ne 12 ]; then
        print_error "Expected 12 SAS drives, found ${#drives[@]}"
        exit 1
    fi
    
    echo "${drives[@]}"
}

# Function to create RAID 6 array
create_raid_array() {
    local drives=("$@")
    local raid_device="/dev/md0"
    
    print_status "Creating RAID 6 array..."
    
    # Check if RAID array already exists
    if [ -e "$raid_device" ]; then
        print_warning "RAID array $raid_device already exists"
        read -p "Do you want to continue and recreate it? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Operation cancelled"
            exit 1
        fi
        mdadm --stop "$raid_device"
    fi
    
    # Create RAID array
    mdadm --create --verbose "$raid_device" --level=6 --raid-devices=${#drives[@]} "${drives[@]}"
    
    # Save RAID configuration
    print_status "Saving RAID configuration..."
    mkdir -p /etc/mdadm
    echo "MAILADDR root" > /etc/mdadm/mdadm.conf
    mdadm --detail --scan >> /etc/mdadm/mdadm.conf
    
    # Update initramfs
    update-initramfs -u
    
    print_status "RAID 6 array created successfully"
}

# Function to setup LVM
setup_lvm() {
    local raid_device="/dev/md0"
    local vg_name="ipfs_vg"
    local lv_name="ipfs_lv"
    
    print_status "Setting up LVM..."
    
    # Create Physical Volume
    pvcreate "$raid_device"
    
    # Create Volume Group
    vgcreate "$vg_name" "$raid_device"
    
    # Create Logical Volume using all available space
    lvcreate -l 100%FREE -n "$lv_name" "$vg_name"
    
    print_status "LVM setup completed"
}

# Function to create and mount filesystem
setup_filesystem() {
    local mount_point="/data/ipfs-storage"
    local lv_path="/dev/ipfs_vg/ipfs_lv"
    
    print_status "Creating filesystem..."
    
    # Format with XFS
    mkfs.xfs "$lv_path"
    
    # Create mount point
    mkdir -p "$mount_point"
    
    # Add to fstab if not already present
    if ! grep -q "$lv_path" /etc/fstab; then
        echo "$lv_path $mount_point xfs defaults 0 0" >> /etc/fstab
    fi
    
    # Mount filesystem
    mount -a
    
    # Set permissions
    chown -R ipfs:ipfs "$mount_point"
    
    print_status "Filesystem created and mounted at $mount_point"
}

# Function to verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check RAID status
    if ! mdadm --detail /dev/md0 &> /dev/null; then
        print_error "RAID array verification failed"
        return 1
    fi
    
    # Check LVM status
    if ! vgdisplay ipfs_vg &> /dev/null; then
        print_error "LVM volume group verification failed"
        return 1
    fi
    
    # Check mount point
    if ! mountpoint -q /data/ipfs-storage; then
        print_error "Filesystem mount verification failed"
        return 1
    fi
    
    print_status "Setup verification completed successfully"
    return 0
}

# Main execution
main() {
    print_status "Starting storage configuration..."
    
    check_root
    check_requirements
    
    # Get list of drives
    local drives=($(identify_sas_drives))
    
    # Create RAID array
    create_raid_array "${drives[@]}"
    
    # Setup LVM
    setup_lvm
    
    # Setup filesystem
    setup_filesystem
    
    # Verify setup
    verify_setup
    
    print_status "Storage configuration completed successfully!"
    print_status "RAID 6 array created with ${#drives[@]} drives"
    print_status "LVM volume group 'ipfs_vg' created"
    print_status "Filesystem mounted at /data/ipfs-storage"
    print_status "Next steps:"
    print_status "1. Verify RAID status: cat /proc/mdstat"
    print_status "2. Verify LVM status: vgs && lvs"
    print_status "3. Verify mount: df -h /data/ipfs-storage"
}

# Run main function
main 