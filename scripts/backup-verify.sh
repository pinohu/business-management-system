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
for cmd in pg_dump pg_restore psql; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Create temporary directory for verification
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Find the most recent backup
LATEST_BACKUP=$(find "$BACKUP_PATH" -name "backup_*.sql" -type f -printf '%T+ %p\n' | sort -r | head -n1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
    echo "Error: No backup files found in $BACKUP_PATH"
    exit 1
fi

echo "Verifying backup: $LATEST_BACKUP"

# Create a test database
TEST_DB="backup_verify_$(date +%Y%m%d_%H%M%S)"
echo "Creating test database: $TEST_DB"

# Try to restore the backup
echo "Attempting to restore backup..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $TEST_DB;"

if PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" "$LATEST_BACKUP"; then
    echo "Backup restored successfully!"

    # Verify database structure
    echo "Verifying database structure..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" -c "\dt"

    # Check for critical tables
    for table in users analytics_data api_keys; do
        if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" -c "\dt $table" | grep -q "$table"; then
            echo "✓ Table $table exists"
        else
            echo "✗ Table $table is missing!"
            exit 1
        fi
    done

    # Check row counts
    echo "Checking row counts..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM users;"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM analytics_data;"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM api_keys;"

    echo "Backup verification completed successfully!"
else
    echo "Error: Failed to restore backup"
    exit 1
fi

# Clean up
echo "Cleaning up..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE $TEST_DB;"
rm -rf "$TEMP_DIR"

echo "Backup verification completed successfully!"
