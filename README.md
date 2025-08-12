# Secupi Gateway with PostgreSQL

A working task implementation of Secupi Gateway for PostgreSQL database protection with email masking. Built on Kubernetes using Minikube.

## Overview

This task implementation sets up a Secupi Gateway that sits between clients and a PostgreSQL database to provide data masking capabilities. When clients query the database through the gateway, sensitive email addresses are automatically masked while other data remains visible.

## What's Working

- PostgreSQL database running in Kubernetes
- Secupi Gateway deployed via Helm chart
- Email masking verified and functional
- SSL connections working
- pgAdmin interface for testing

## Quick Start

### Prerequisites

You'll need these tools installed (on macOS with Homebrew):

```bash
brew install minikube kubectl helm postgresql openssl openjdk
```

### Minikube Setup

Start Minikube with proper configuration:

```bash
# Start Minikube with Docker driver
minikube start --driver=docker

# Verify cluster is running
kubectl cluster-info
kubectl get nodes

# Check Minikube status
minikube status
```

### Database Setup

1. Deploy PostgreSQL:
```bash
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-storage.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
```

2. Verify PostgreSQL deployment:
```bash
# Check pods are running
kubectl get pods -l app=postgres

# Check services
kubectl get svc postgres-service

# Check persistent volume
kubectl get pv,pvc
```

3. Create test data:
```bash
kubectl apply -f postgres-client-pod.yaml

# Wait for client pod to be ready
kubectl wait --for=condition=Ready pod/postgres-client --timeout=60s

# Create database table and insert test data
kubectl exec postgres-client -- psql -h postgres-service -U postgres -d postgresdb -c "
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (name, email, phone) VALUES 
('John Doe', 'john.doe@example.com', '555-1234'),
('Jane Smith', 'jane.smith@example.com', '555-5678'),
('Bob Wilson', 'bob.wilson@company.com', '555-9999');
"

# Verify data was inserted
kubectl exec postgres-client -- psql -h postgres-service -U postgres -d postgresdb -c "SELECT * FROM customers;"
```

4. Test PostgreSQL connectivity:
```bash
# Test internal connection (should show real emails)
kubectl exec postgres-client -- psql -h postgres-service -U postgres -d postgresdb -c "SELECT name, email FROM customers;"

# Get PostgreSQL ClusterIP for reference
kubectl get svc postgres-service -o jsonpath='{.spec.clusterIP}'
```

### Gateway Setup

1. Download and extract the Helm chart:
```bash
wget https://storage.googleapis.com/secupi-shared/secupi-gateway-postgresql-7.0.0-59.tgz
tar -xzf secupi-gateway-postgresql-7.0.0-59.tgz
```

2. Create SSL certificates:
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout secupi-gateway.key -out secupi-gateway.crt \
  -subj "/CN=secupi-gateway/O=secupi"

# Convert to Java keystore format
openssl pkcs12 -export -out keystore.p12 \
  -inkey secupi-gateway.key -in secupi-gateway.crt \
  -password pass:test123456

keytool -importkeystore -deststorepass test123456 \
  -destkeystore keystore.jks -srckeystore keystore.p12 \
  -srcstoretype PKCS12 -srcstorepass test123456 -noprompt
```

3. Create Kubernetes secrets:
```bash
# Registry access
kubectl create secret docker-registry secupiregistry \
  --docker-server=registry.gitlab.com \
  --docker-username=gitlab \
  --docker-password=<YOUR_GITLAB_TOKEN>

# SSL keystore
kubectl create secret generic secupi-gateway-gateway-keystore \
  --from-file=keystore.jks=keystore.jks
```

4. Update configuration and deploy:
```bash
# Get PostgreSQL ClusterIP and update custom-values.yaml
POSTGRES_IP=$(kubectl get svc postgres-service -o jsonpath='{.spec.clusterIP}')
echo "PostgreSQL ClusterIP: $POSTGRES_IP"
sed -i "s/GATEWAY_SERVER_HOST: \".*\"/GATEWAY_SERVER_HOST: \"$POSTGRES_IP\"/" secupi-gateway-postgresql/custom-values.yaml

# Install gateway
helm install secupi-gateway ./secupi-gateway-postgresql -f ./secupi-gateway-postgresql/custom-values.yaml

# Verify gateway deployment
kubectl get pods -l app=secupi-gateway-gateway
kubectl get svc secupi-gateway-gateway

# Check gateway logs
kubectl logs $(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}')
```

## Connectivity Testing

### Direct PostgreSQL Connection (Baseline)
```bash
# Connect directly to PostgreSQL (bypasses gateway)
kubectl exec postgres-client -- psql -h postgres-service -U postgres -d postgresdb -c "SELECT * FROM customers;"
```

### Gateway Connection (With Masking)
```bash
# Get gateway ClusterIP
GATEWAY_IP=$(kubectl get service secupi-gateway-gateway -o jsonpath='{.spec.clusterIP}')
echo "Gateway ClusterIP: $GATEWAY_IP"

# Connect through gateway (shows masked data)
kubectl exec postgres-client -- psql "sslmode=allow host=$GATEWAY_IP port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers;"
```

## Testing Email Masking

### Direct Database Access (unmasked)
```bash
kubectl exec postgres-client -- psql -h postgres-service -U postgres -d postgresdb -c "SELECT * FROM customers;"
```

Results show real email addresses:
```
john.doe@example.com
jane.smith@example.com
bob.wilson@company.com
```

### Through Gateway (masked)
```bash
GATEWAY_IP=$(kubectl get service secupi-gateway-gateway -o jsonpath='{.spec.clusterIP}')
kubectl exec postgres-client -- psql "sslmode=allow host=$GATEWAY_IP port=5432 user=postgres dbname=postgresdb" -c "SELECT * FROM customers;"
```

Results show masked emails:
```
XXXXXXXX@example.com
XXXXXXXXXX@example.com
XXXXXXXXXX@company.com
```

### Using pgAdmin

Deploy pgAdmin for a GUI interface:
```bash
kubectl apply -f pgadmin-deployment.yaml
kubectl port-forward pod/$(kubectl get pods -l app=pgadmin -o jsonpath='{.items[0].metadata.name}') 8080:80
```

Connect to gateway at `http://localhost:8080` with:
- Host: [Gateway ClusterIP]
- Port: 5432
- Username: postgres
- Password: strongpassword123
- SSL mode: allow

## Configuration Details

The gateway uses these key settings:

- **Boot URL**: Downloads configuration from the specified server
- **Image**: registry.gitlab.com/secupi/secupi-distribution:7.0.0.59
- **SSL**: Enabled with self-signed certificates
- **Backend**: Connects to PostgreSQL ClusterIP service

The gateway is configured to use version 7.0.0.59 as specified in the task requirements, with masking configuration downloaded from the boot URL.

## Troubleshooting

### Connection Issues
If you get connection refused errors, the PostgreSQL ClusterIP probably changed. Update it:
```bash
POSTGRES_IP=$(kubectl get svc postgres-service -o jsonpath='{.spec.clusterIP}')
sed -i "s/GATEWAY_SERVER_HOST: \".*\"/GATEWAY_SERVER_HOST: \"$POSTGRES_IP\"/" secupi-gateway-postgresql/custom-values.yaml
helm upgrade secupi-gateway ./secupi-gateway-postgresql -f ./secupi-gateway-postgresql/custom-values.yaml
```

### pgAdmin Port Forward Fails
Try connecting directly to the pod instead of service:
```bash
kubectl port-forward pod/[pgadmin-pod-name] 8080:80
```

### Gateway Not Starting
Check logs and make sure secrets are created:
```bash
kubectl logs $(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}')
kubectl get secrets
```

## Files

- `postgres-*.yaml` - PostgreSQL deployment files
- `pgadmin-deployment.yaml` - pgAdmin interface
- `secupi-gateway-postgresql/` - Helm chart directory
- `custom-values.yaml` - Gateway configuration
- `keystore.jks` - SSL certificate for gateway

## Status

Everything is working. Email masking is verified through both command line and pgAdmin testing. The gateway successfully protects sensitive email data while allowing normal database operations.

## Notes

This task demonstrates a working Secupi Gateway setup for PostgreSQL data protection in a Kubernetes environment.
