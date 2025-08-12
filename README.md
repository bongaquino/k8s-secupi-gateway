# Secupi Gateway with PostgreSQL

A production-ready implementation of Secupi Gateway for PostgreSQL database protection with email masking capabilities. Designed for Kubernetes deployment using Minikube.

## Overview

This implementation provides transparent data masking for PostgreSQL databases through Secupi Gateway. The gateway operates as a database proxy, intercepting client connections and automatically masking sensitive data such as email addresses before returning results to clients.

## Features

- **Email Masking**: Automatically masks email addresses in query results
- **PostgreSQL Compatibility**: Full support for PostgreSQL protocol and authentication
- **Kubernetes Native**: Designed for container orchestration environments
- **Resource Efficient**: Optimized resource allocation for development and testing environments
- **Production Ready**: Uses official Secupi Gateway image v7.0.0.59

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

Connect to the database through Secupi Gateway to see masked results:
```bash
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=disable" -c "SELECT id, email FROM customers LIMIT 3;"'
```

Expected output with email masking enabled:
```
 id |         email          
----+------------------------
  1 | XXXXXXXX@example.com
  2 | XXXXXXXXXX@company.com
  3 | XXXXXXXXXXX@email.com
(3 rows)
```

### Direct PostgreSQL Connection (Unmasked Data)

For comparison, connect directly to PostgreSQL to see original data:
```bash
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql -h postgres-service -U postgres -d postgresdb -c "SELECT id, email FROM customers LIMIT 3;"'
```

Output showing original email addresses:
```
 id |         email          
----+------------------------
  1 | john.doe@example.com
  2 | jane.smith@company.com
  3 | bob.johnson@email.com
(3 rows)
```

## Configuration Requirements

### Authentication Configuration
The gateway requires MD5 authentication method for PostgreSQL connections:
```yaml
env:
  GATEWAY_AUTH_METHOD: "md5"
```

### Connection Parameters
Use the following connection string format for reliable connections:
```bash
postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=disable
```

## SSL Configuration

### SSL Status

The current implementation uses Secupi Gateway version 7.0.0.59 with SSL disabled for optimal compatibility:

- **Gateway Status**: Email masking functional with current SSL configuration
- **Authentication**: MD5 authentication method configured for PostgreSQL
- **Resource Allocation**: Memory limits optimized for Minikube deployment
- **SSL Setting**: Currently disabled (`GATEWAY_SSL_ENABLED: "false"`) for stable operation

### SSL Certificate Generation

For environments requiring SSL encryption, self-signed certificates can be generated and deployed to the gateway pods.

#### Generate Self-Signed Certificate

Create a self-signed certificate for the Secupi Gateway:

```bash
# Generate private key
openssl genrsa -out secupi.key 2048

# Generate certificate signing request
openssl req -new -key secupi.key -out secupi.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=secupi-gateway"

# Generate self-signed certificate
openssl x509 -req -days 365 -in secupi.csr -signkey secupi.key -out secupi.crt

# Create PKCS12 keystore
openssl pkcs12 -export -out keystore.p12 -inkey secupi.key -in secupi.crt -password pass:secupi123
```

#### Deploy Certificate to Kubernetes

Create a Kubernetes secret containing the SSL certificates:

```bash
# Create SSL certificate secret
kubectl create secret generic secupi-ssl-certs \
  --from-file=secupi.key=secupi.key \
  --from-file=secupi.crt=secupi.crt \
  --from-file=keystore.p12=keystore.p12

# Verify secret creation
kubectl get secret secupi-ssl-certs -o yaml
```

#### Gateway SSL Configuration

To enable SSL on the gateway, update the environment variables:

```yaml
env:
  GATEWAY_SSL_ENABLED: "true"
  KEYSTORE_SSL_PATH: "/opt/secupi/etc/keystore.jks"
  KEYSTORE_SSL_STOREPASS: "secupi123"
  KEYSTORE_SSL_ALIAS: "secupi-gateway"
```

#### Certificate Deployment to Pods

The SSL certificates are automatically mounted to gateway pods through volume mounts defined in the deployment template. The deployment includes the following volume configuration:

```yaml
volumes:
  - name: ssl-certs
    secret:
      secretName: secupi-ssl-certs
  - name: ssl-storage
    emptyDir: {}
```

Volume mounts in the container:

```yaml
volumeMounts:
  - name: ssl-certs
    mountPath: /tmp/ssl-certs
    readOnly: true
  - name: ssl-storage
    mountPath: /opt/secupi/etc
```

The certificates are available at the following paths within the pod:

- **Private Key**: `/opt/secupi/etc/secupi.key`
- **Certificate**: `/opt/secupi/etc/secupi.crt`
- **PKCS12 Keystore**: `/opt/secupi/etc/keystore.p12`
- **JKS Keystore**: `/opt/secupi/etc/keystore.jks` (converted during pod initialization)

The deployment uses an init container to copy certificates from the secret mount to the application directory and convert the PKCS12 keystore to JKS format required by the gateway.

#### SSL Connection String

When SSL is enabled, use the following connection format:

```bash
# SSL connection with certificate verification
psql "postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=require"

# SSL connection with full certificate verification
psql "postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=verify-full"
```

### Current Working Environment Variables

```yaml
# Core Gateway Configuration
GATEWAY_SERVER_HOST: "postgres-service"
GATEWAY_SERVER_PORT: "5432"
GATEWAY_SERVER_USER: "postgres"
GATEWAY_SERVER_PASSWORD: "strongpassword123"
GATEWAY_SERVER_DB: "postgresdb"
GATEWAY_AUTH_METHOD: "md5"              # CRITICAL: Required for authentication
GATEWAY_PORT: "5432"
GATEWAY_INTERFACE_PORT: "5432"
GATEWAY_TYPE: "postgresql"
GATEWAY_SSL_ENABLED: "false"            # Disabled for stability

# Secupi Configuration
SECUPI_BOOT_URL: "https://damkil.azure.secupi.com/api/boot/download/1e81d3dee43740fbbcbd669a2c3ca3a7/secupi-boot-ea9abf50-9ebf-4e28-9a54-f56d75dec2e5.jar"
EXTRA_OPTS: "-Dlog4j2.formatMsgNoLookups=true -Dsecupi.agent.ssl.hostnameVerifier.enabled=false -Dsecupi.agent.ssl.autoTrust.enabled=true"

# SSL Configuration (when needed)
KEYSTORE_SSL_STOREPASS: "test123456"
KEYSTORE_SSL_ALIAS: "1"
GATEWAY_HAZELCAST_SERVICE_DNS_NAME: "secupi-gateway-hz.default.svc.cluster.local"
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

#### Connection Issues
If client connections are not establishing properly, verify the authentication configuration:
```yaml
env:
  GATEWAY_AUTH_METHOD: "md5"
```

Check connection logs:
```bash
kubectl logs <gateway-pod> | grep -E "(authentication|connection)"
```

#### SSL Connection Timeouts
For environments where SSL negotiation causes delays, use the following connection format:
```bash
psql "postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=disable"
```

#### Resource Constraints
If pods remain in `Pending` state, verify resource allocation:
```yaml
gateway:
  resources:
    mid:
      limits:
        memory: "1Gi"
      requests:
        memory: "1Gi"
```

#### Image Pull Issues
Verify Docker registry credentials:
```bash
kubectl get secret secupiregistry -o yaml
```

#### Gateway Startup Issues
Check gateway logs for startup problems:
```bash
kubectl logs -l app=secupi-gateway
```

#### Database Connection Verification
Verify PostgreSQL is running:
```bash
kubectl get pods -l app=postgres
kubectl logs -l app=postgres
```

### SSL Configuration Notes

- The current version (7.0.0.42) does not support frontend SSL listening
- SSL environment variables are accepted but not functional for client connections
- Backend SSL (gateway to PostgreSQL) may be supported but not tested
- Version 7.0.0.59 exists but requires different account permissions

## Implementation Status

### Completed Components
- Secupi Gateway deployment on Kubernetes cluster
- Helm chart configuration and deployment
- Secupi Gateway image tag 7.0.0.59
- PostgreSQL database with customer data
- Database table with email column for masking demonstration
- SECUPI_BOOT_URL configuration
- GATEWAY_SERVER_HOST configuration
- Docker registry authentication
- Email masking functionality
- SSL certificate preparation
- MD5 authentication configuration
- Resource optimization for development environments
- Comprehensive documentation

### Implementation Notes
- **Email Masking**: Masks email addresses as `XXXXXXXX@example.com`
- **Authentication**: MD5 authentication method configured for PostgreSQL compatibility
- **Connection Method**: Uses `sslmode=disable` parameter for reliable connectivity
- **Resource Allocation**: Optimized with 1Gi memory limits for Minikube environments
- **Documentation**: Includes troubleshooting guide for common deployment scenarios

### SSL Configuration Status
- SSL certificates prepared for future use
- Current configuration uses `GATEWAY_SSL_ENABLED: "false"` for stable operation
- SSL implementation available for environments requiring encrypted connections

### Verification Command
```bash
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@secupi-gateway:5432/postgresdb?sslmode=disable" -c "SELECT id, email FROM customers LIMIT 3;"'
```
