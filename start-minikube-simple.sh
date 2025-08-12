#!/bin/bash

# Simple Minikube Auto-Start Script
# Run this manually after reboot or set it up in your login items

echo "🚀 Starting Minikube and Secupi Gateway..."

# Check if Docker is running
echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "Opening Docker Desktop..."
    open -a Docker
    echo "Waiting for Docker to start..."
    sleep 30
fi

# Start Minikube
echo "🔄 Starting Minikube..."
minikube start --driver=docker

# Check if minikube started successfully
if [ $? -eq 0 ]; then
    echo "✅ Minikube started successfully!"
else
    echo "❌ Failed to start Minikube"
    exit 1
fi

echo "🎯 Minikube is ready! Your Secupi Gateway deployment should automatically come back up."
echo "💡 To check status: kubectl get pods"
echo "🔗 Gateway access: minikube service secupi-gateway-gateway --url"

# Optional: Display current status
kubectl get pods -o wide
