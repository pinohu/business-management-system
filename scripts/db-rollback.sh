#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.production

# Configuration
BACKUP_DIR="/backup"
ROLLBACK_DIR="/tmp/rollback"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
for cmd in docker docker-compose psql; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Create rollback directory
mkdir -p "$ROLLBACK_DIR"

# Get current database state
echo "Capturing current database state..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$ROLLBACK_DIR/current_state_$TIMESTAMP.sql"

# Find the last successful migration
echo "Finding last successful migration..."
LAST_MIGRATION=$(docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrations:list | grep "success" | tail -n1 | awk '{print $1}')

if [ -z "$LAST_MIGRATION" ]; then
    echo "Error: No successful migrations found"
    exit 1
fi

# Create rollback SQL
echo "Creating rollback SQL..."
cat > "$ROLLBACK_DIR/rollback_$TIMESTAMP.sql" << EOF
-- Rollback to migration: $LAST_MIGRATION
BEGIN;

-- Drop all tables and types
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Restore from last successful migration
\i /backup/migrations/$LAST_MIGRATION.sql

COMMIT;
EOF

# Execute rollback
echo "Executing rollback..."
docker-compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "/rollback/rollback_$TIMESTAMP.sql"

# Verify rollback
echo "Verifying rollback..."
docker-compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version FROM migrations ORDER BY id DESC LIMIT 1;"

# Archive rollback files
echo "Archiving rollback files..."
tar -czf "$BACKUP_DIR/rollback_$TIMESTAMP.tar.gz" -C "$ROLLBACK_DIR" .

# Clean up
echo "Cleaning up..."
rm -rf "$ROLLBACK_DIR"

echo "Rollback completed successfully!"
echo "Rollback files archived to: $BACKUP_DIR/rollback_$TIMESTAMP.tar.gz"
