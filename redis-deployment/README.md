# Redis Deployment

This repository contains scripts and configuration files for deploying and testing a Redis server.

## Contents

- `redis.conf`: Redis server configuration file.
- `deploy.sh`: Script to deploy Redis on a server.
- `redis-load-test.js`: Node.js script to perform load testing on Redis.

## Prerequisites

- Node.js and npm installed.
- Redis server running on the target machine.

## Deployment

1. **Configure Redis:**
   - Edit `redis.conf` to set your desired Redis configuration.
   - Ensure the Redis server is running on the target machine.

2. **Deploy Redis:**
   - Run the deployment script:
     ```bash
     ./deploy.sh
     ```

## Load Testing

To run a load test on your Redis server:

1. **Install Dependencies:**
   ```bash
   npm install redis
   ```

2. **Run the Load Test:**
   ```bash
   node redis-load-test.js
   ```

   This will perform random operations (GET, SET, DEL, KEYS) on your Redis server for 30 seconds and report the results.

## Troubleshooting Guide

### Redis Server Issues

- **Redis Server Not Starting:**
  - Check if Redis is installed: `redis-cli ping`
  - Verify the Redis configuration file (`redis.conf`) for errors.
  - Check Redis logs for errors: `sudo tail -f /var/log/redis/redis-server.log`

- **Connection Refused:**
  - Ensure Redis is running: `sudo systemctl status redis`
  - Check if the Redis port (default: 6379) is open and not blocked by a firewall.

- **Permission Issues:**
  - Ensure the Redis user has the necessary permissions to access the Redis data directory.

### Load Testing Issues

- **Node.js Script Errors:**
  - Ensure Node.js and npm are installed: `node -v` and `npm -v`
  - Check for syntax errors in `redis-load-test.js`.
  - Verify that the Redis client is correctly configured with the correct host and port.

- **Redis Client Connection Issues:**
  - Ensure the Redis server is accessible from the machine running the load test.
  - Check if the Redis server is running and accepting connections.

### Grafana Issues

- **Grafana Not Accessible:**
  - Ensure Grafana is running: `sudo systemctl status grafana-server`
  - Check if the Grafana port (default: 3000) is open and not blocked by a firewall.

- **Data Source Connection Issues:**
  - Verify the Redis data source configuration in Grafana.
  - Ensure the Redis server is accessible from the Grafana server.

- **Authentication Issues:**
  - Reset the Grafana admin password if needed: `sudo grafana-cli admin reset-admin-password admin`

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Grafana Documentation](https://grafana.com/docs/) 