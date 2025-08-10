#!/bin/bash

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Check Ubuntu version
UBUNTU_VERSION=$(lsb_release -rs)
if [ "$UBUNTU_VERSION" != "24.04" ]; then
    print_warning "This script is tested on Ubuntu 24.04. You are running Ubuntu $UBUNTU_VERSION"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install required packages
print_status "Installing required packages..."
apt-get update
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    docker.io \
    docker-compose

# Start and enable Docker
print_status "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Create necessary directories
print_status "Creating required directories..."
mkdir -p /var/log/mongodb
chmod 755 /var/log/mongodb

# Copy configuration files
print_status "Setting up configuration files..."
if [ ! -f ".env" ]; then
    cp env.example .env
    print_warning "Please update the .env file with your desired configuration"
fi

# Set proper permissions
print_status "Setting proper permissions..."
chmod 600 .env
chmod 644 mongod.conf

# Start MongoDB
print_status "Starting MongoDB..."
docker-compose up -d

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
sleep 10

# Test MongoDB connection
print_status "Testing MongoDB connection..."
if docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" --quiet; then
    print_status "MongoDB is running and accessible!"
else
    print_error "Failed to connect to MongoDB"
    print_status "Checking logs..."
    docker-compose logs mongodb
    exit 1
fi

# Create test database and collection
print_status "Creating test database and collection..."
docker-compose exec mongodb mongosh --eval '
db = db.getSiblingDB("testdb");
db.createCollection("testcollection");
db.testcollection.insertOne({ test: "data", timestamp: new Date() });
'

# Verify test data
print_status "Verifying test data..."
docker-compose exec mongodb mongosh --eval '
db = db.getSiblingDB("testdb");
db.testcollection.find().pretty();
'

print_status "Deployment completed successfully!"
print_status "MongoDB is running and accessible on port 27017"
print_status "You can connect using: mongodb://localhost:27017"

# Display connection information
print_status "Connection details:"
echo "Host: localhost"
echo "Port: 27017"
echo "Database: testdb"
echo "Username: $(grep MONGO_ROOT_USERNAME .env | cut -d '=' -f2)"
echo "Password: $(grep MONGO_ROOT_PASSWORD .env | cut -d '=' -f2)"

# Display useful commands
print_status "Useful commands:"
echo "View logs: docker-compose logs -f mongodb"
echo "Stop MongoDB: docker-compose down"
echo "Restart MongoDB: docker-compose restart"
echo "Check status: docker-compose ps" 