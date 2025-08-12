#!/bin/bash

# Secupi Gateway Auto-Startup Script
# This script will start Minikube and redeploy the Secupi Gateway after a reboot

set -e

LOG_FILE="/tmp/secupi-gateway-startup.log"
ERROR_LOG="/tmp/secupi-gateway-startup-error.log"

# Function to log messages
log() {
    echo "$(date): $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date): ERROR - $1" | tee -a "$ERROR_LOG"
}

log "Starting Secupi Gateway auto-startup script..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

log "Docker is running..."

# Start Minikube
log "Starting Minikube..."
minikube start --driver=docker

# Wait for Minikube to be ready
log "Waiting for Minikube to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# Navigate to the project directory
cd "$(dirname "$0")"

log "Deploying PostgreSQL..."
# Deploy PostgreSQL components
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-storage.yaml  
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# Wait for PostgreSQL to be ready
log "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=Ready pod -l app=postgres --timeout=300s

# Create client pod
log "Creating PostgreSQL client pod..."
kubectl apply -f postgres-client-pod.yaml
kubectl wait --for=condition=Ready pod/postgres-client --timeout=60s

# Deploy pgAdmin
log "Deploying pgAdmin..."
kubectl apply -f pgadmin-deployment.yaml
kubectl wait --for=condition=Ready pod -l app=pgadmin --timeout=300s

# Create secrets for Secupi Gateway
log "Creating Secupi Gateway secrets..."
kubectl create secret docker-registry secupiregistry \
  --docker-server=registry.gitlab.com \
  --docker-username=gitlab \
  --docker-password=<YOUR_GITLAB_TOKEN> \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic secupi-gateway-gateway-keystore \
  --from-file=keystore.jks=keystore.jks \
  --dry-run=client -o yaml | kubectl apply -f -

# Update PostgreSQL ClusterIP in custom-values.yaml
log "Updating PostgreSQL ClusterIP in configuration..."
POSTGRES_IP=$(kubectl get svc postgres-service -o jsonpath='{.spec.clusterIP}')
log "PostgreSQL ClusterIP: $POSTGRES_IP"
sed -i "s/GATEWAY_SERVER_HOST: \".*\"/GATEWAY_SERVER_HOST: \"$POSTGRES_IP\"/" secupi-gateway-postgresql/custom-values.yaml

# Deploy Secupi Gateway
log "Deploying Secupi Gateway..."
helm install secupi-gateway ./secupi-gateway-postgresql -f ./secupi-gateway-postgresql/custom-values.yaml

# Wait for gateway to be ready
log "Waiting for Secupi Gateway to be ready..."
kubectl wait --for=condition=Ready pod -l app=secupi-gateway-gateway --timeout=300s

log "✅ Secupi Gateway deployment completed successfully!"
log "🎯 All services are now running and ready for use."

# Display status
kubectl get pods -o wide
kubectl get svc

log "Auto-startup completed at $(date)"
