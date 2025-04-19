#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.production

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
for cmd in kubectl helm; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Create namespace if it doesn't exist
echo "Creating namespace..."
kubectl create namespace analytics --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
echo "Creating secrets..."
kubectl create secret generic analytics-secrets \
    --namespace analytics \
    --from-literal=JWT_SECRET=$JWT_SECRET \
    --from-literal=POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    --from-literal=REDIS_PASSWORD=$REDIS_PASSWORD \
    --from-literal=GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD \
    --dry-run=client -o yaml | kubectl apply -f -

# Create ConfigMap
echo "Creating ConfigMap..."
kubectl create configmap analytics-config \
    --namespace analytics \
    --from-literal=NODE_ENV=production \
    --from-literal=PORT=8000 \
    --from-literal=CORS_ORIGIN=https://example.com \
    --from-literal=RATE_LIMIT_WINDOW=15m \
    --from-literal=RATE_LIMIT_MAX_REQUESTS=100 \
    --dry-run=client -o yaml | kubectl apply -f -

# Deploy PostgreSQL
echo "Deploying PostgreSQL..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install postgres bitnami/postgresql \
    --namespace analytics \
    --set auth.username=$POSTGRES_USER \
    --set auth.password=$POSTGRES_PASSWORD \
    --set auth.database=$POSTGRES_DB \
    --set primary.persistence.size=10Gi \
    --set primary.persistence.storageClass=standard \
    --set primary.resources.requests.memory=1Gi \
    --set primary.resources.requests.cpu=500m \
    --set primary.resources.limits.memory=2Gi \
    --set primary.resources.limits.cpu=1000m

# Deploy Redis
echo "Deploying Redis..."
helm install redis bitnami/redis \
    --namespace analytics \
    --set auth.password=$REDIS_PASSWORD \
    --set master.persistence.size=5Gi \
    --set master.persistence.storageClass=standard \
    --set master.resources.requests.memory=512Mi \
    --set master.resources.requests.cpu=250m \
    --set master.resources.limits.memory=1Gi \
    --set master.resources.limits.cpu=500m

# Deploy monitoring stack
echo "Deploying monitoring stack..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
    --namespace analytics \
    --set grafana.adminPassword=$GRAFANA_ADMIN_PASSWORD \
    --set prometheus.prometheusSpec.retention=15d \
    --set prometheus.prometheusSpec.resources.requests.memory=1Gi \
    --set prometheus.prometheusSpec.resources.requests.cpu=500m \
    --set prometheus.prometheusSpec.resources.limits.memory=2Gi \
    --set prometheus.prometheusSpec.resources.limits.cpu=1000m

# Deploy backend
echo "Deploying backend..."
kubectl apply -f k8s/backend.yaml

# Deploy frontend
echo "Deploying frontend..."
kubectl apply -f k8s/frontend.yaml

# Deploy ingress
echo "Deploying ingress..."
kubectl apply -f k8s/ingress.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n analytics
kubectl wait --for=condition=available --timeout=300s deployment/backend -n analytics
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n analytics
kubectl wait --for=condition=available --timeout=300s deployment/redis-master -n analytics

# Set up database backup
echo "Setting up database backup..."
kubectl apply -f k8s/backup-cronjob.yaml

# Set up monitoring alerts
echo "Setting up monitoring alerts..."
kubectl apply -f k8s/prometheus-rules.yaml

# Get service URLs
echo "Deployment complete! Services are available at:"
echo "Frontend: https://example.com"
echo "Backend API: https://api.example.com"
echo "WebSocket: wss://ws.example.com"
echo "Prometheus: https://prometheus.example.com"
echo "Grafana: https://grafana.example.com"

# Verify deployments
echo "Verifying deployments..."
kubectl get pods -n analytics
kubectl get services -n analytics
kubectl get ingress -n analytics
