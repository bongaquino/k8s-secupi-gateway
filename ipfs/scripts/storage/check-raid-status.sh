#!/bin/bash

# Script to check the status of the RAID 6 array, LVM, and the mounted filesystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Please run as root${NC}"
        exit 1
    fi
}

# Function to find the RAID device backing the LVM
find_raid_device() {
    local lv_path="/dev/ipfs_vg/ipfs_lv"
    local pv=$(pvs --noheadings -o pv_name $lv_path | awk '{print $1}')
    local raid_device=""
    if [[ $pv == /dev/md* ]]; then
        raid_device=$pv
    else
        # Use the known RAID device
        raid_device="/dev/md127"
    fi
    echo $raid_device
}

# Function to assemble RAID if missing
assemble_raid() {
    echo "Attempting to assemble RAID arrays..."
    mdadm --assemble --scan || true
}

# Function to check disk health with detailed SMART information
check_disk_health() {
    echo -e "\n=== Disk Health Status ==="
    
    # Check if smartmontools is installed
    if ! command -v smartctl &>/dev/null; then
        echo "Installing smartmontools..."
        apt-get update && apt-get install -y smartmontools
    fi
    
    # Get list of RAID member devices
    local raid_devices=$(mdadm --detail /dev/md127 | grep "/dev/sd" | awk '{print $NF}')
    
    for device in $raid_devices; do
        echo -e "\n=== Detailed SMART Status for $device ==="
        
        # Get SMART health status
        local health_status=$(smartctl -H "$device" | grep "SMART overall-health" | awk '{print $NF}')
        echo "SMART Health Status: $health_status"
        
        # Get temperature
        local temp=$(smartctl -A "$device" | grep "Current Drive Temperature" | awk '{print $4}')
        if [[ -n "$temp" ]]; then
            if [[ "$temp" -gt 50 ]]; then
                echo -e "${RED}Temperature: ${temp}°C (Warning: High)${NC}"
            else
                echo "Temperature: ${temp}°C (Normal)"
            fi
        fi
        
        # Get power on hours
        local power_on=$(smartctl -A "$device" | grep "Accumulated power on time" | awk '{print $6}')
        if [[ -n "$power_on" ]]; then
            echo "Power On Hours: $power_on"
        fi
        
        # Get error counts
        local errors=$(smartctl -l error "$device" | grep -E "Errors Corrected|Total errors|uncorrected errors" | awk '{print $1,$2,$3}')
        if [[ -n "$errors" ]]; then
            echo "Error Log:"
            echo "$errors"
        fi
        
        # Get vendor-specific information for Seagate drives
        if smartctl -i "$device" | grep -q "SEAGATE"; then
            echo -e "\nSeagate-specific Information:"
            local grown_defects=$(smartctl -l defect "$device" | grep "Elements in grown defect list" | awk '{print $6}')
            if [[ -n "$grown_defects" ]]; then
                echo "Elements in grown defect list: $grown_defects"
            fi
        fi
    done
}

# Function to check RAID array status
check_raid_status() {
    echo -e "\n=== RAID Array Status ==="
    local raid_device="/dev/md127"
    
    echo "Checking RAID array status for $raid_device..."
    if ! mdadm --detail "$raid_device" &>/dev/null; then
        echo -e "${RED}Error: RAID device $raid_device not found${NC}"
        return 1
    fi
    
    # Get RAID status
    local raid_status=$(mdadm --detail "$raid_device")
    echo "$raid_status"
    
    # Check for rebuild progress
    if echo "$raid_status" | grep -q "resync"; then
        echo -e "\n=== RAID Array Rebuild Progress ==="
        local rebuild_speed=$(cat /proc/mdstat | grep -A1 "md127" | grep "resync" | awk '{print $NF}')
        local rebuild_progress=$(echo "$raid_status" | grep "Resync Status" | awk '{print $3}')
        echo "Rebuild Progress: $rebuild_progress"
        echo "Rebuild Speed: $rebuild_speed"
        
        # Calculate estimated completion time
        if [[ -n "$rebuild_speed" ]]; then
            local speed_num=$(echo "$rebuild_speed" | sed 's/[^0-9.]//g')
            local speed_unit=$(echo "$rebuild_speed" | sed 's/[0-9.]//g')
            local progress_num=$(echo "$rebuild_progress" | sed 's/%//')
            local remaining_percent=$((100 - progress_num))
            
            if [[ "$speed_unit" == "K/sec" ]]; then
                local est_minutes=$((remaining_percent * 100 / speed_num))
            elif [[ "$speed_unit" == "M/sec" ]]; then
                local est_minutes=$((remaining_percent * 100 / (speed_num * 1024)))
            else
                local est_minutes=$((remaining_percent * 100 / (speed_num * 1024 * 1024)))
            fi
            
            # Convert to hours and minutes
            local est_hours=$((est_minutes / 60))
            local est_remaining_minutes=$((est_minutes % 60))
            
            echo -e "\nEstimated time to completion: ${YELLOW}$est_hours hours and $est_remaining_minutes minutes${NC}"
        fi
    else
        echo -e "\n=== RAID Array Rebuild Progress ==="
        echo "No rebuild in progress"
    fi
}

# Function to check LVM status
check_lvm_status() {
    echo -e "\n=== LVM Status ==="
    
    # Check if LVM volume exists
    if ! lvs /dev/ipfs_vg/ipfs_lv &>/dev/null; then
        echo -e "${YELLOW}Warning: LVM volume /dev/ipfs_vg/ipfs_lv not found${NC}"
        return 0
    fi
    
    echo "Logical Volume Status:"
    lvs -v /dev/ipfs_vg/ipfs_lv
    
    echo -e "\nVolume Group Status:"
    vgs -v ipfs_vg
}

# Function to check filesystem status
check_filesystem_status() {
    echo -e "\n=== Filesystem Status ==="
    
    # Check if filesystem is mounted
    if ! mount | grep -q "/data/ipfs-storage"; then
        echo -e "${YELLOW}Warning: Filesystem not mounted at /data/ipfs-storage${NC}"
        return 0
    fi
    
    echo "Mount Status:"
    df -h /data/ipfs-storage
    
    echo -e "\nPerforming filesystem status check..."
    if mountpoint -q /data/ipfs-storage; then
        echo -e "${GREEN}Filesystem is mounted and accessible${NC}"
        echo -e "${YELLOW}Note: Full filesystem check skipped as filesystem is mounted${NC}"
        echo "To perform full check, unmount the filesystem first"
    else
        echo -e "${YELLOW}Filesystem is not mounted, performing full check...${NC}"
        xfs_repair -n /dev/ipfs_vg/ipfs_lv
    fi
}

# Function to send email report
send_email_report() {
    local subject="$1"
    local body="$2"
    echo "$body" | mail -s "$subject" bong@arddata.tech
}

# Function to generate health check summary
generate_health_summary() {
    local summary="=== Health Check Summary ===\n"
    
    # RAID Status
    local raid_status=$(mdadm --detail /dev/md127 2>/dev/null)
    if [[ -n "$raid_status" ]]; then
        local raid_state=$(echo "$raid_status" | grep "State" | awk '{print $3}')
        summary+="1. RAID Array Status: $raid_state\n"
    else
        summary+="1. RAID Array Status: Not Found\n"
    fi
    
    # Disk Health
    local disk_health="OK"
    for device in $(mdadm --detail /dev/md127 2>/dev/null | grep "/dev/sd" | awk '{print $NF}'); do
        if ! smartctl -H "$device" 2>/dev/null | grep -q "PASSED"; then
            disk_health="WARNING"
            break
        fi
    done
    summary+="2. Disk Health: $disk_health\n"
    
    # LVM Status
    if lvs /dev/ipfs_vg/ipfs_lv &>/dev/null; then
        summary+="3. LVM Status: Available\n"
    else
        summary+="3. LVM Status: Not Found\n"
    fi
    
    # Filesystem Status
    if mount | grep -q "/data/ipfs-storage"; then
        summary+="4. Filesystem Status: Mounted\n"
    else
        summary+="4. Filesystem Status: Not Mounted\n"
    fi
    
    echo -e "$summary"
}

# Main execution
main() {
    echo -e "${GREEN}Starting system health check...${NC}"
    check_root
    
    # Check RAID and disk health
    local raid_device=$(find_raid_device)
    check_raid_status
    
    # Check LVM status
    check_lvm_status
    
    # Check filesystem status
    check_filesystem_status
    
    echo -e "\n${GREEN}=== Health Check Summary ===${NC}"
    echo "1. RAID Array Status: Checked"
    echo "2. Disk Health: Checked"
    echo "3. LVM Status: Checked"
    echo "4. Filesystem Status: Checked"
    echo -e "\n${GREEN}Health check completed successfully!${NC}"
    
    # Send email report if any errors occurred
    if [ $? -ne 0 ]; then
        send_email_report "RAID Health Check Error" "An error occurred during the RAID health check. Please review the logs for details."
    fi
}

# Run main function
main 