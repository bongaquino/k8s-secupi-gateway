# SecuPi Gateway with PostgreSQL SSL Configuration

This repository contains the complete setup for deploying SecuPi Gateway with PostgreSQL using SSL encryption and data masking capabilities in Kubernetes.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  SecuPi Gateway │───▶│   PostgreSQL    │
│                 │    │   (Data Mask)   │    │   (SSL Enabled) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      SSL verify-full         SSL require           SSL enabled
```

## 📋 Components

- **PostgreSQL 16**: Database server with SSL encryption
- **SecuPi Gateway**: Data masking proxy with SSL termination
- **SSL Certificates**: Custom certificates for secure communication
- **Client Pod**: Testing container with PostgreSQL client tools

## 🚀 Quick Start

### 1. Deploy the Infrastructure

```bash
# Deploy persistent volumes, secrets, and services
kubectl apply -f all-in-one.yaml -n default

# Deploy SSL-enabled PostgreSQL
kubectl apply -f postgres-deployment.yaml -n default

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n default --timeout=120s
```

### 2. Initialize the Database

```bash
# Initialize database with sample data
cat init-db.sql | kubectl exec -i $(kubectl get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}') -n default -- bash -c 'PGPASSWORD=strongpassword123 psql -U postgres -d customersdb'
```

### 3. Setup SSL Certificates

```bash
# Create SSL certificates secret for PostgreSQL
kubectl create secret generic postgres-ssl-certs \
  --from-file=server.crt=server.crt \
  --from-file=server.key=server.key \
  --from-file=client.crt=client.crt \
  --from-file=client.key=client.key \
  --namespace=default

# Create fixed gateway keystore with correct hostname
kubectl exec $(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}') -n default -- \
  keytool -genkeypair -alias 1 -keyalg RSA -keysize 2048 \
  -keystore /tmp/gateway-fixed.jks -storepass test123456 -keypass test123456 \
  -dname "CN=secupi-gateway-gateway.default.svc.cluster.local,O=SecuPi Software,L=City,ST=State,C=US" \
  -validity 365

# Copy and update the keystore
kubectl cp default/$(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}'):/tmp/gateway-fixed.jks ./gateway-fixed.jks

kubectl delete secret secupi-gateway-gateway-keystore -n default
kubectl create secret generic secupi-gateway-gateway-keystore --from-file=keystore.jks=gateway-fixed.jks -n default

# Restart gateway to pick up new certificate
kubectl rollout restart deployment secupi-gateway-gateway -n default
kubectl wait --for=condition=ready pod -l app=secupi-gateway-gateway -n default --timeout=120s
```

### 4. Setup Client SSL Configuration

```bash
# Create .postgresql directory in client pod
kubectl exec postgres-client -- mkdir -p /root/.postgresql

# Extract and copy gateway certificate for SSL verification
kubectl exec $(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}') -n default -- \
  keytool -exportcert -alias 1 -keystore /opt/secupi/etc/keystore.jks -storepass test123456 -rfc | \
  kubectl exec -i postgres-client -- bash -c 'cat > /root/.postgresql/root.crt'
```

## 🔒 SSL Connection Examples

### Direct PostgreSQL Connection (No Masking)

```bash
# SSL verify-ca mode
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@postgres-service:5432/customersdb?sslmode=verify-ca" -c "SELECT id, email FROM customers LIMIT 3;"'

# SSL verify-full mode  
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@postgres-service.default.svc.cluster.local:5432/customersdb?sslmode=verify-full" -c "SELECT id, email FROM customers LIMIT 3;"'
```

**Output:** Real email addresses (no masking)
```
 id |         email          
----+------------------------
  1 | john.doe@example.com
  2 | jane.smith@company.com
  3 | bob.johnson@email.com
```

### SecuPi Gateway Connection (With Masking)

```bash
# SSL disabled (for testing)
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@secupi-gateway-gateway:5432/customersdb?sslmode=disable" -c "SELECT id, email FROM customers LIMIT 3;"'

# SSL verify-full mode (RECOMMENDED)
kubectl exec postgres-client -- bash -c 'PGPASSWORD=strongpassword123 psql "postgresql://postgres@secupi-gateway-gateway.default.svc.cluster.local:5432/customersdb?sslmode=verify-full" -c "SELECT id, email FROM customers LIMIT 3;"'
```

**Output:** Masked email addresses (data protection active)
```
 id |         email          
----+------------------------
  1 | XXXXXXXX@example.com
  2 | XXXXXXXXXX@company.com
  3 | XXXXXXXXXXX@email.com
```

## 📁 File Structure

```
k8s-secupi-gateway/
├── README.md                    # This documentation
├── all-in-one.yaml             # PV, PVC, Secret, Service, Client Pod
├── postgres-deployment.yaml    # SSL-enabled PostgreSQL deployment
├── custom-values.yaml          # SecuPi Gateway Helm values
├── init-db.sql                 # Database initialization script
├── server.crt                  # PostgreSQL server certificate
├── server.key                  # PostgreSQL server private key
├── client.crt                  # PostgreSQL client certificate
├── client.key                  # PostgreSQL client private key
├── gateway.crt                 # Gateway certificate (original)
├── gateway.key                 # Gateway private key (original)
├── gateway.jks                 # Gateway Java keystore (original)
└── gateway-fixed.jks           # Fixed gateway keystore with correct hostname
```

## 🔧 Configuration Details

### PostgreSQL SSL Configuration

The PostgreSQL deployment includes:
- SSL enabled with custom certificates
- SSL mode: `ssl=on`
- Certificate files mounted in `/var/lib/postgresql/ssl/`
- Authentication method: `md5`

### SecuPi Gateway Configuration

Key environment variables:
```yaml
GATEWAY_SSL_ENABLED: "true"
GATEWAY_SSL_MODE: "verify-full"
GATEWAY_BACKEND_SSL_MODE: "require"
KEYSTORE_SSL_PATH: "/opt/secupi/etc/keystore.jks"
KEYSTORE_SSL_STOREPASS: "test123456"
KEYSTORE_SSL_ALIAS: "1"
```

### SSL Certificate Requirements

For `verify-full` SSL mode to work:
1. Certificate CN must match the service hostname
2. Certificate must be properly signed
3. Root CA certificate must be available to client
4. Private key must be accessible to server

## 🐛 Troubleshooting

### Common SSL Issues

1. **Certificate verify failed**
   - Ensure certificate CN matches hostname
   - Check root certificate is properly copied to client

2. **No peer certificate available**
   - Verify keystore is properly mounted
   - Check gateway SSL configuration

3. **Hostname verification failed**
   - Use full Kubernetes service name: `service.namespace.svc.cluster.local`
   - Regenerate certificate with correct CN

### Debug Commands

```bash
# Check pod status
kubectl get pods -n default

# View gateway logs
kubectl logs $(kubectl get pods -l app=secupi-gateway-gateway -o jsonpath='{.items[0].metadata.name}') -n default

# Check PostgreSQL logs
kubectl logs $(kubectl get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}') -n default

# Verify certificate content
kubectl exec postgres-client -- openssl x509 -in /root/.postgresql/root.crt -text -noout

# Test SSL connection
kubectl exec postgres-client -- openssl s_client -connect secupi-gateway-gateway.default.svc.cluster.local:5432 -servername secupi-gateway-gateway.default.svc.cluster.local < /dev/null
```

## 🔐 Security Features

- **End-to-End SSL Encryption**: All connections use SSL/TLS
- **Certificate Validation**: verify-full mode ensures hostname matching
- **Data Masking**: Sensitive data automatically masked by SecuPi Gateway
- **Authentication**: PostgreSQL md5 authentication required
- **Network Isolation**: Kubernetes network policies supported

## 📊 Performance Considerations

- **Connection Pooling**: Gateway provides connection pooling
- **SSL Overhead**: Minimal performance impact with modern hardware
- **Data Masking**: Real-time masking with negligible latency
- **Scalability**: Horizontal scaling supported via Kubernetes

## 🆕 Updates and Maintenance

### Updating Certificates

```bash
# Generate new certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server-new.key -out server-new.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=postgres-service.default.svc.cluster.local"

# Update secret
kubectl create secret generic postgres-ssl-certs-new \
  --from-file=server.crt=server-new.crt \
  --from-file=server.key=server-new.key \
  --namespace=default

# Update deployment to use new secret
kubectl patch deployment postgres -p '{"spec":{"template":{"spec":{"volumes":[{"name":"postgres-ssl-temp","secret":{"secretName":"postgres-ssl-certs-new"}}]}}}}'
```

### Scaling the Gateway

```bash
# Scale gateway deployment
kubectl scale deployment secupi-gateway-gateway --replicas=3 -n default

# Verify scaling
kubectl get pods -l app=secupi-gateway-gateway -n default
```

## 📝 License

This configuration is provided as-is for demonstration purposes. Please ensure compliance with your organization's security policies and SecuPi licensing terms.

## 🤝 Contributing

1. Test changes in a development environment
2. Verify SSL functionality with both connection modes
3. Ensure data masking is working correctly
4. Update documentation as needed

---

**✅ Successfully Configured Features:**
- ✅ PostgreSQL 16 with SSL encryption
- ✅ SecuPi Gateway with data masking
- ✅ SSL verify-full mode working
- ✅ Proper certificate hostname validation
- ✅ End-to-end secure communication
