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
for cmd in docker docker-compose git; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
BACKUP_DIR="backups/deployments"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ROLLBACK_VERSION=$1

# Function to validate rollback version
validate_version() {
    if [ -z "$ROLLBACK_VERSION" ]; then
        echo "Error: Please provide a rollback version (commit hash or tag)"
        exit 1
    fi

    if ! git show "$ROLLBACK_VERSION" >/dev/null 2>&1; then
        echo "Error: Invalid version $ROLLBACK_VERSION"
        exit 1
    fi
}

# Function to backup current state
backup_current_state() {
    echo "Creating backup of current state..."
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    mkdir -p "$BACKUP_PATH"

    # Backup database
    echo "Backing up database..."
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_PATH/database.sql"

    # Backup environment files
    echo "Backing up environment files..."
    cp .env.production "$BACKUP_PATH/"
    cp .env.development "$BACKUP_PATH/"

    # Backup Docker volumes
    echo "Backing up Docker volumes..."
    docker run --rm -v "$(pwd):/backup" -v "${COMPOSE_PROJECT_NAME}_data:/data" alpine tar czf /backup/data_backup.tar.gz /data

    echo "Backup created at: $BACKUP_PATH"
}

# Function to stop services
stop_services() {
    echo "Stopping services..."
    docker-compose down
}

# Function to restore previous version
restore_version() {
    echo "Restoring to version $ROLLBACK_VERSION..."
    git checkout "$ROLLBACK_VERSION"

    # Restore environment files
    echo "Restoring environment files..."
    cp "$BACKUP_PATH/.env.production" .env.production
    cp "$BACKUP_PATH/.env.development" .env.development

    # Restore Docker volumes
    echo "Restoring Docker volumes..."
    docker run --rm -v "$(pwd):/backup" -v "${COMPOSE_PROJECT_NAME}_data:/data" alpine sh -c "cd /data && tar xzf /backup/data_backup.tar.gz"
}

# Function to start services
start_services() {
    echo "Starting services..."
    docker-compose up -d

    # Wait for services to be healthy
    echo "Waiting for services to be healthy..."
    sleep 30

    # Check service health
    if ! docker-compose ps | grep -q "healthy"; then
        echo "Error: Services failed to start properly"
        return 1
    fi
}

# Function to verify deployment
verify_deployment() {
    echo "Verifying deployment..."

    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        echo "Error: Services are not running"
        return 1
    fi

    # Check database connection
    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Error: Database connection failed"
        return 1
    fi

    # Check application health endpoint
    if ! curl -s http://localhost:3000/health | grep -q "ok"; then
        echo "Error: Application health check failed"
        return 1
    fi

    echo "Deployment verification successful!"
    return 0
}

# Main rollback process
echo "Starting rollback process..."

# Validate rollback version
validate_version

# Create backup of current state
backup_current_state

# Stop services
stop_services

# Restore previous version
restore_version

# Start services
if ! start_services; then
    echo "Error: Failed to start services"
    exit 1
fi

# Verify deployment
if ! verify_deployment; then
    echo "Error: Deployment verification failed"
    echo "Rolling back to previous state..."
    git checkout HEAD
    docker-compose down
    docker-compose up -d
    exit 1
fi

echo "Rollback completed successfully!"
