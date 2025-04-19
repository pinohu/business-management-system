#!/bin/bash

# Create necessary directories
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis

# Set up environment variables
cp .env.example .env

# Build and start the containers
docker-compose up -d --build

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

echo "Local development environment is ready!"
echo "Application is running at http://localhost:3000"
echo "Grafana is available at http://localhost:3001 (admin/admin)"
echo "Prometheus is available at http://localhost:9090"
