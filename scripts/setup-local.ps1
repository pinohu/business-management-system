# Create necessary directories
New-Item -ItemType Directory -Force -Path "logs"
New-Item -ItemType Directory -Force -Path "data/postgres"
New-Item -ItemType Directory -Force -Path "data/redis"

# Set up environment variables
Copy-Item -Path ".env.example" -Destination ".env" -Force

# Build and start the containers
docker-compose up -d --build

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 10

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

Write-Host "Local development environment is ready!"
Write-Host "Application is running at http://localhost:3000"
Write-Host "Grafana is available at http://localhost:3001 (admin/admin)"
Write-Host "Prometheus is available at http://localhost:9090"
