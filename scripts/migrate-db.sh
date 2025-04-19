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
for cmd in psql prisma; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
MIGRATION_DIR="backend/prisma/migrations"
BACKUP_DIR="backups/migrations"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to backup database
backup_database() {
    echo "Creating database backup..."
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_FILE"
    echo "Backup created: $BACKUP_FILE"
}

# Function to rollback migration
rollback_migration() {
    echo "Rolling back migration..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$BACKUP_FILE"
    echo "Rollback completed"
}

# Check if there are pending migrations
if ! npx prisma migrate status | grep -q "No pending migrations"; then
    echo "Pending migrations found. Starting migration process..."

    # Create backup before migration
    backup_database

    # Attempt to apply migrations
    echo "Applying migrations..."
    if npx prisma migrate deploy; then
        echo "Migrations applied successfully!"

        # Verify database structure
        echo "Verifying database structure..."
        npx prisma db pull

        # Check for critical tables
        for table in users analytics_data api_keys; do
            if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt $table" | grep -q "$table"; then
                echo "✓ Table $table exists"
            else
                echo "✗ Table $table is missing! Rolling back..."
                rollback_migration
                exit 1
            fi
        done

        # Generate Prisma client
        echo "Generating Prisma client..."
        npx prisma generate

        echo "Migration process completed successfully!"
    else
        echo "Error: Migration failed. Rolling back..."
        rollback_migration
        exit 1
    fi
else
    echo "No pending migrations found."
fi

# Clean up old backups (keep last 5)
echo "Cleaning up old backups..."
cd "$BACKUP_DIR" && ls -t | tail -n +6 | xargs -r rm --

echo "Migration process completed!"
