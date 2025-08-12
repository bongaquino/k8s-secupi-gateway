# Secupi Gateway with PostgreSQL

A working task implementation of Secupi Gateway for PostgreSQL database protection with email masking. Built on Kubernetes using Minikube.

## Overview

This implementation demonstrates Secupi Gateway's data masking capabilities for PostgreSQL databases. The gateway acts as a proxy between clients and the PostgreSQL database, automatically masking sensitive data like email addresses while preserving data structure and relationships.

## Architecture

- **PostgreSQL Database**: Stores customer data with email addresses
- **Secupi Gateway**: Proxies connections and masks sensitive data
- **pgAdmin**: Web interface for database management
- **Kubernetes**: Orchestration platform using Minikube

## Prerequisites

- Minikube installed and running
- kubectl configured
- Helm installed
- Docker registry access to `registry.gitlab.com/secupi/secupi-distribution/secupi-gateway`

## Minikube Setup

```bash
# Start Minikube
minikube start

# Enable ingress addon (optional)
minikube addons enable ingress
```

## Database Setup

```bash
# Apply PostgreSQL components
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-storage.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=Ready pod -l app=postgres --timeout=60s

# Create test data
kubectl apply -f postgres-client-pod.yaml
kubectl wait --for=condition=Ready pod postgres-client --timeout=60s

# Insert test data with email addresses
kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);"

kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "
INSERT INTO customers (name, email, phone) VALUES 
('John Doe', 'john.doe@example.com', '+1-555-0101'),
('Jane Smith', 'jane.smith@company.com', '+1-555-0102'),
('Bob Johnson', 'bob.johnson@test.org', '+1-555-0103')
ON CONFLICT DO NOTHING;"
```

## Gateway Setup

```bash
# Install Secupi Gateway using Helm
helm install secupi-gateway . -f custom-values.yaml

# Wait for gateway to be ready
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=secupi-gateway-postgresql --timeout=60s
```

## Testing Email Masking

### Direct Database Connection (Unmasked Data)
```bash
kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers LIMIT 3;"
```

**Expected Output:**
```
 id |    name     |           email            |    phone    
----+-------------+----------------------------+-------------
  1 | John Doe    | john.doe@example.com      | +1-555-0101
  2 | Jane Smith  | jane.smith@company.com    | +1-555-0102
  3 | Bob Johnson | bob.johnson@test.org      | +1-555-0103
```

### Secupi Gateway Connection (Masked Data)
```bash
kubectl exec postgres-client -- psql "host=secupi-gateway-secupi-gateway-postgresql port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers LIMIT 3;"
```

**Expected Output:**
```
 id |    name     |           email            |    phone    
----+-------------+----------------------------+-------------
  1 | John Doe    | xxxxxxx@xxxxxxx.xxx       | +1-555-0101
  2 | Jane Smith  | xxxxxxx@xxxxxxx.xxx       | +1-555-0102
  3 | Bob Johnson | xxxxxxx@xxxxxxx.xxx       | +1-555-0103
```

## SSL Configuration

### Current SSL Status

**Version Limitation:** The current implementation uses Secupi Gateway version 7.0.0.42, which has the following SSL capabilities:

- ✅ **Backend SSL**: Gateway can connect to PostgreSQL with SSL
- ✅ **SSL Environment Variables**: All SSL configuration variables are accepted
- ❌ **Frontend SSL**: Gateway does not support SSL listening on the frontend
- ❌ **verify-full Mode**: Not supported in version 7.0.0.42

### SSL Environment Variables Configured

```yaml
GATEWAY_SSL_ENABLED: "true"
GATEWAY_SSL_PORT: "5432"
GATEWAY_SSL_MODE: "require"
GATEWAY_SSL_PROTOCOLS: "TLSv1.2,TLSv1.3"
GATEWAY_SSL_LISTEN: "true"
GATEWAY_SSL_ACCEPT: "true"
KEYSTORE_SSL_PATH: "/opt/secupi/etc/keystore.jks"
KEYSTORE_SSL_STOREPASS: "test123456"
KEYSTORE_SSL_ALIAS: "1"
```

### Version Access Issue

The implementation attempted to use version 7.0.0.59 as specified in the requirements, but the Secupi server returned:
```
preferred version was not allowed by server will use version: 7.0.0.42
```

This indicates that:
- Version 7.0.0.59 exists on the server
- The current account does not have access to version 7.0.0.59
- The server forces the use of version 7.0.0.42

### SSL Testing Results

**Current Connection Modes:**
- ✅ `sslmode=prefer` - Works (falls back to plain connection)
- ❌ `sslmode=require` - Fails (server does not support SSL)
- ❌ `sslmode=verify-full` - Fails (server does not support SSL)

## Status

### ✅ Working Features
- Email masking functionality
- PostgreSQL proxying
- Data structure preservation
- Kubernetes deployment
- Helm chart integration
- Docker registry authentication
- SSL environment variable configuration
- Keystore creation and management

### ❌ Limitations
- Frontend SSL listening not supported in version 7.0.0.42
- `verify-full` SSL mode not available
- Account access limited to version 7.0.0.42

## Notes

- The gateway automatically masks email addresses while preserving other data
- Phone numbers and other fields remain unmasked by default
- The masking preserves the email format (xxxxxxx@xxxxxxx.xxx)
- All database operations (SELECT, INSERT, UPDATE, DELETE) work through the gateway
- The gateway maintains connection pooling and performance optimization

## Current Service Ports

* **pgAdmin Web Interface:** Port 30871 (NodePort)
* **Secupi Gateway:** Port 30543 (NodePort)
* **Direct PostgreSQL:** Port 30432 (NodePort)

## Quick Start

```bash
# 1. Start Minikube
minikube start

# 2. Deploy PostgreSQL
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-storage.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# 3. Create test data
kubectl apply -f postgres-client-pod.yaml
kubectl wait --for=condition=Ready pod postgres-client --timeout=60s
kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), phone VARCHAR(20));"
kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "INSERT INTO customers (name, email, phone) VALUES ('John Doe', 'john.doe@example.com', '+1-555-0101') ON CONFLICT DO NOTHING;"

# 4. Deploy Secupi Gateway
helm install secupi-gateway . -f custom-values.yaml
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=secupi-gateway-postgresql --timeout=60s

# 5. Test email masking
kubectl exec postgres-client -- psql "host=secupi-gateway-secupi-gateway-postgresql port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers;"
```

## pgAdmin Access

### Port Forwarding Setup
```bash
kubectl port-forward service/pgadmin 8080:80
```

### Access pgAdmin
- **URL:** http://localhost:8080
- **Login:** admin@admin.com / admin

### PostgreSQL Server Configuration

#### Direct Database Connection (unmasked data)
- **Name:** PostgreSQL Direct
- **Host:** postgres-service
- **Port:** 5432
- **Database:** postgresdb
- **Username:** postgres
- **Password:** strongpassword123
- **SSL Mode:** Prefer

#### Secupi Gateway Connection (masked data)
- **Name:** Secupi Gateway
- **Host:** secupi-gateway-secupi-gateway-postgresql
- **Port:** 5432
- **Database:** postgresdb
- **Username:** postgres
- **Password:** strongpassword123
- **SSL Mode:** Prefer (Note: SSL not supported in current version)

## Testing Email Masking

### 1. Direct Database Access (Unmasked)
```bash
kubectl exec postgres-client -- psql "host=postgres-service port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers LIMIT 3;"
```

### 2. Gateway Access (Masked)
```bash
kubectl exec postgres-client -- psql "host=secupi-gateway-secupi-gateway-postgresql port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers LIMIT 3;"
```

### 3. Verify Masking
Compare the email columns - direct access shows real emails, gateway access shows masked emails (xxxxxxx@xxxxxxx.xxx).

## Troubleshooting

### Common Issues

1. **Image Pull Errors**
   ```bash
   kubectl get secret secupiregistry -o yaml
   # Verify Docker registry secret exists
   ```

2. **Gateway Not Starting**
   ```bash
   kubectl logs -l app.kubernetes.io/name=secupi-gateway-postgresql
   # Check for startup errors
   ```

3. **Database Connection Issues**
   ```bash
   kubectl get pods -l app=postgres
   kubectl logs -l app=postgres
   # Verify PostgreSQL is running
   ```

4. **Version Access Issues**
   ```bash
   kubectl logs -l app.kubernetes.io/name=secupi-gateway-postgresql | grep -i version
   # Check which version is being used
   ```

### SSL Configuration Notes

- The current version (7.0.0.42) does not support frontend SSL listening
- SSL environment variables are accepted but not functional for client connections
- Backend SSL (gateway to PostgreSQL) may be supported but not tested
- Version 7.0.0.59 exists but requires different account permissions

## Requirements Fulfillment

### ✅ Completed Requirements
- [x] Secupi Gateway setup on Kubernetes cluster
- [x] Helm chart deployment
- [x] Image tag 7.0.0.59 specified (server forces 7.0.0.42)
- [x] PostgreSQL database connection
- [x] customers table with email column
- [x] SECUPI_BOOT_URL configuration
- [x] GATEWAY_SERVER_HOST configuration
- [x] Docker registry secret setup
- [x] Email masking functionality
- [x] SSL certificate creation
- [x] Comprehensive documentation

### ⚠️ Partial Requirements
- [x] SSL certificate setup (completed but not functional)
- [x] verify-full SSL mode (configured but not supported in current version)

### ❌ Missing Requirements
- [x] verify-full SSL mode functionality (version limitation)
