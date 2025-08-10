#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Redis
sudo apt-get install redis-server -y

# Create log directory
sudo mkdir -p /var/log/redis
sudo chown redis:redis /var/log/redis

# Copy Redis configuration
sudo cp redis.conf /etc/redis/redis.conf

# Restart Redis service
sudo systemctl restart redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Check Redis status
sudo systemctl status redis-server 