# PostgreSQL Gateway Setup in Kubernetes (Minikube)

This guide will help you deploy PostgreSQL with a gateway service in your Minikube cluster for learning Kubernetes concepts.

## Prerequisites
- Minikube installed and running with Docker driver
- kubectl configured to work with your minikube cluster
- Docker installed and running on your system

## Files Overview
- `postgres-secret.yaml` - Kubernetes Secret for PostgreSQL credentials
- `postgres-storage.yaml` - PersistentVolume and PersistentVolumeClaim for data persistence
- `postgres-deployment.yaml` - PostgreSQL Deployment configuration
- `postgres-service.yaml` - Both ClusterIP service (internal) and NodePort service (gateway)
- `postgres-client-pod.yaml` - Test client pod for internal connections

## Step-by-Step Deployment

### 1. Start Minikube (if not already running)
```bash
# Start minikube with Docker driver (if not already started)
minikube start --driver=docker

# Verify driver
minikube config get driver
```

### 2. Apply the configurations in order
```bash
# Create the secret first
kubectl apply -f postgres-secret.yaml

# Create storage resources
kubectl apply -f postgres-storage.yaml

# Deploy PostgreSQL
kubectl apply -f postgres-deployment.yaml

# Create services (internal + gateway)
kubectl apply -f postgres-service.yaml

# Optional: Create test client pod
kubectl apply -f postgres-client-pod.yaml
```

### 3. Verify the deployment
```bash
# Check all resources
kubectl get all

# Check persistent volumes
kubectl get pv,pvc

# Check secrets
kubectl get secrets

# Watch pods until ready
kubectl get pods -w
```

### 4. Test Internal Connection (using client pod)
```bash
# Wait for client pod to be ready, then connect
kubectl exec -it postgres-client -- psql -h postgres-service -U postgres -d postgresdb

# Inside psql, you can run:
# \l                    # List databases
# \dt                   # List tables
# CREATE TABLE test (id SERIAL PRIMARY KEY, name VARCHAR(50));
# INSERT INTO test (name) VALUES ('Hello Kubernetes');
# SELECT * FROM test;
# \q                    # Quit
```

### 5. Test External Connection (via Gateway)

#### Option A: Using minikube service (Recommended for Docker driver)
```bash
# This automatically opens the service and handles port forwarding
minikube service postgres-gateway

# Or get the URL without opening
minikube service postgres-gateway --url
```

#### Option B: Using minikube IP directly
```bash
# Get minikube IP
minikube ip

# Connect from your local machine (replace <MINIKUBE_IP> with actual IP)
psql -h <MINIKUBE_IP> -p 30432 -U postgres -d postgresdb
```

#### Option C: Port forwarding (Alternative method)
```bash
# Forward local port 5432 to the service
kubectl port-forward service/postgres-service 5432:5432

# Then connect to localhost
psql -h localhost -p 5432 -U postgres -d postgresdb
```

Or using a GUI tool like pgAdmin, DBeaver, etc.:
- **Method A**: Use the URL from `minikube service postgres-gateway --url`
- **Method B**: Host: `<MINIKUBE_IP>`, Port: `30432`
- **Method C**: Host: `localhost`, Port: `5432` (if using port-forward)
- Username: `postgres`
- Password: `strongpassword123`
- Database: `postgresdb`

## Understanding the Components

### Secret
Contains base64-encoded credentials:
- Username: postgres
- Password: strongpassword123
- Database: postgresdb

### Services
1. **postgres-service** (ClusterIP): Internal access only, used by other pods in the cluster
2. **postgres-gateway** (NodePort): External access via node port 30432

### Storage
- PersistentVolume: 5GB storage for PostgreSQL data
- PersistentVolumeClaim: Request for storage that binds to the PV

### Deployment
- Uses PostgreSQL 15 Alpine image
- Includes health checks (liveness and readiness probes)
- Resource limits and requests defined
- Mounts persistent storage for data persistence

## Useful Commands

```bash
# View logs
kubectl logs deployment/postgres-deployment

# Get service details
kubectl describe service postgres-gateway

# Check minikube service status
minikube service list

# Access service via minikube (Docker driver friendly)
minikube service postgres-gateway --url

# Port forward for local testing (alternative to NodePort)
kubectl port-forward service/postgres-service 5432:5432

# Scale deployment (though PostgreSQL should typically be 1 replica)
kubectl scale deployment postgres-deployment --replicas=1

# Check minikube status
minikube status

# SSH into minikube node (useful for troubleshooting)
minikube ssh

# Delete everything
kubectl delete -f .
```

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Storage issues
```bash
kubectl describe pv postgres-pv
kubectl describe pvc postgres-pvc

# For Docker driver, check if directory exists in minikube
minikube ssh "ls -la /mnt/data/"
```

### Connection issues
```bash
# Check if service endpoints are ready
kubectl get endpoints postgres-service

# Test DNS resolution from inside cluster
kubectl exec -it postgres-client -- nslookup postgres-service

# Check service accessibility via minikube
minikube service postgres-gateway --url

# If NodePort not working, try port-forward
kubectl port-forward service/postgres-service 5432:5432
```

### Docker Driver Specific Issues
```bash
# Check minikube docker daemon
minikube docker-env

# Check if minikube can pull images
minikube ssh "docker images | grep postgres"

# Restart minikube if networking issues
minikube stop && minikube start --driver=docker
```

## Learning Points

This setup demonstrates:
1. **Secrets management** - Storing sensitive data securely
2. **Persistent storage** - Data persistence across pod restarts
3. **Service types** - ClusterIP vs NodePort for different access patterns
4. **Health checks** - Liveness and readiness probes
5. **Resource management** - CPU and memory limits/requests
6. **Network policies** - Internal vs external access patterns

## Next Steps

Try experimenting with:
- Creating multiple replicas (though PostgreSQL typically needs special handling for HA)
- Setting up a read replica
- Implementing backup strategies
- Using ConfigMaps for PostgreSQL configuration
- Setting up monitoring with Prometheus
- Implementing network policies for security
