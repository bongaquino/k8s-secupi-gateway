# MongoDB Deployment with Mongo Express and Data Generator

This project sets up a complete MongoDB environment with a web-based management interface (Mongo Express) and a data generator service for testing and development purposes.

## Features

- **MongoDB 4.4**: Production-ready database server
- **Mongo Express**: Web-based MongoDB admin interface
- **Data Generator**: Node.js service for generating test data
- **Auto-restart**: All services configured for automatic recovery
- **Docker Compose**: Easy deployment and management
- **Data Persistence**: Volume-based data storage

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM
- At least 20GB free disk space
- Network access to required ports (27017, 8081)

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mongodb-deployment
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your desired credentials
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access Mongo Express at http://localhost:8081
   - Username: admin
   - Password: (from your .env file)

## Service Details

### MongoDB
- Port: 27017
- Authentication: Enabled
- Data Persistence: Docker volume
- Auto-restart: Always

### Mongo Express
- Port: 8081
- Features: Web-based MongoDB management
- Authentication: Basic Auth enabled
- Auto-restart: Always

### Data Generator
- Generates sample data for:
  - Stock prices
  - User activities
  - System metrics
- Auto-restart: Unless-stopped

## Management Commands

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d mongodb
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop mongodb
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mongodb
```

### Checking Status
```bash
docker-compose ps
```

## Troubleshooting Guide

### 1. Connection Issues

#### Cannot connect to MongoDB
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify network
docker network ls
docker network inspect mongodb_network
```

#### Cannot access Mongo Express
```bash
# Check if service is running
docker-compose ps mongo-express

# Check logs
docker-compose logs mongo-express

# Verify port availability
netstat -tulpn | grep 8081
```

### 2. Data Issues

#### Data not persisting
```bash
# Check volume
docker volume ls
docker volume inspect mongodb_data

# Verify data directory permissions
ls -la /var/lib/docker/volumes/
```

#### Data Generator not working
```bash
# Check logs
docker-compose logs data-generator

# Restart service
docker-compose restart data-generator
```

### 3. Performance Issues

#### High Memory Usage
```bash
# Check container stats
docker stats

# Check MongoDB memory usage
docker exec mongodb mongosh --eval "db.serverStatus().mem"
```

#### Slow Queries
```bash
# Check MongoDB logs for slow queries
docker-compose logs mongodb | grep "slow query"

# Check current operations
docker exec mongodb mongosh --eval "db.currentOp()"
```

### 4. Common Error Solutions

#### "Port already in use"
```bash
# Find process using port
sudo lsof -i :27017
sudo lsof -i :8081

# Stop conflicting service
sudo systemctl stop <service-name>
```

#### "Authentication failed"
1. Verify credentials in .env file
2. Check MongoDB logs for auth errors
3. Reset MongoDB container:
   ```bash
   docker-compose down
   docker volume rm mongodb_data
   docker-compose up -d
   ```

#### "Container keeps restarting"
1. Check container logs
2. Verify system resources
3. Check for configuration errors

## Backup and Restore

### Backup
```bash
# Create backup
docker exec mongodb mongodump --out /backup

# Copy backup from container
docker cp mongodb:/backup ./backup
```

### Restore
```bash
# Copy backup to container
docker cp ./backup mongodb:/backup

# Restore data
docker exec mongodb mongorestore /backup
```

## Security Recommendations

1. Change default passwords in .env file
2. Restrict network access to MongoDB port
3. Use strong authentication
4. Regular security updates
5. Monitor access logs

## Maintenance

### Regular Tasks
1. Monitor disk space
2. Check logs for errors
3. Backup data regularly
4. Update Docker images
5. Review security settings

### Update Process
```bash
# Pull latest images
docker-compose pull

# Update services
docker-compose up -d
```

## Support

For issues not covered in this guide:
1. Check Docker and MongoDB documentation
2. Review service logs
3. Contact system administrator
4. Open an issue in the repository

## License

[Your License Information] 