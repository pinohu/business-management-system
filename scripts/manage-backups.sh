#!/bin/bash

# Exit on error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
for cmd in pg_dump tar aws; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
S3_BUCKET="your-backup-bucket"
S3_PREFIX="backups"

# Function to create backup directory
create_backup_dir() {
    local backup_path="$BACKUP_DIR/$TIMESTAMP"
    mkdir -p "$backup_path"
    echo "$backup_path"
}

# Function to backup database
backup_database() {
    local backup_path=$1
    echo "Backing up database..."

    # Backup PostgreSQL database
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$backup_path/database.sql"

    # Compress database backup
    gzip "$backup_path/database.sql"

    echo "Database backup completed: $backup_path/database.sql.gz"
}

# Function to backup application data
backup_application() {
    local backup_path=$1
    echo "Backing up application data..."

    # Backup environment files
    cp .env.production "$backup_path/"
    cp .env.development "$backup_path/"

    # Backup Docker volumes
    echo "Backing up Docker volumes..."
    docker run --rm -v "$(pwd):/backup" -v "${COMPOSE_PROJECT_NAME}_data:/data" alpine tar czf /backup/data_backup.tar.gz /data

    # Move backup to backup directory
    mv data_backup.tar.gz "$backup_path/"

    echo "Application backup completed: $backup_path/data_backup.tar.gz"
}

# Function to upload backup to S3
upload_to_s3() {
    local backup_path=$1
    echo "Uploading backup to S3..."

    # Upload database backup
    aws s3 cp "$backup_path/database.sql.gz" "s3://$S3_BUCKET/$S3_PREFIX/$TIMESTAMP/database.sql.gz"

    # Upload application backup
    aws s3 cp "$backup_path/data_backup.tar.gz" "s3://$S3_BUCKET/$S3_PREFIX/$TIMESTAMP/data_backup.tar.gz"

    # Upload environment files
    aws s3 cp "$backup_path/.env.production" "s3://$S3_BUCKET/$S3_PREFIX/$TIMESTAMP/.env.production"
    aws s3 cp "$backup_path/.env.development" "s3://$S3_BUCKET/$S3_PREFIX/$TIMESTAMP/.env.development"

    echo "Backup uploaded to S3: s3://$S3_BUCKET/$S3_PREFIX/$TIMESTAMP/"
}

# Function to verify backup
verify_backup() {
    local backup_path=$1
    echo "Verifying backup..."

    # Verify database backup
    if ! gunzip -t "$backup_path/database.sql.gz"; then
        echo "Error: Database backup verification failed"
        return 1
    fi

    # Verify application backup
    if ! tar -tzf "$backup_path/data_backup.tar.gz" > /dev/null 2>&1; then
        echo "Error: Application backup verification failed"
        return 1
    fi

    echo "Backup verification completed successfully"
    return 0
}

# Function to clean up old backups
cleanup_old_backups() {
    echo "Cleaning up old backups..."

    # Clean up local backups
    find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

    # Clean up S3 backups
    aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" | while read -r line; do
        createDate=$(echo "$line" | awk {'print $1" "$2'})
        createDate=$(date -d "$createDate" +%s)
        olderThan=$(date -d "-$RETENTION_DAYS days" +%s)
        if [[ $createDate -lt $olderThan ]]; then
            fileName=$(echo "$line" | awk {'print $4'})
            if [[ $fileName != "" ]]; then
                aws s3 rm "s3://$S3_BUCKET/$S3_PREFIX/$fileName"
                echo "Deleted: $fileName"
            fi
        fi
    done
}

# Function to restore backup
restore_backup() {
    local backup_timestamp=$1
    local backup_path="$BACKUP_DIR/$backup_timestamp"

    echo "Restoring backup from $backup_timestamp..."

    # Download backup from S3
    aws s3 sync "s3://$S3_BUCKET/$S3_PREFIX/$backup_timestamp/" "$backup_path/"

    # Restore database
    echo "Restoring database..."
    gunzip -c "$backup_path/database.sql.gz" | PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB"

    # Restore application data
    echo "Restoring application data..."
    docker run --rm -v "$(pwd):/backup" -v "${COMPOSE_PROJECT_NAME}_data:/data" alpine sh -c "cd /data && tar xzf /backup/data_backup.tar.gz"

    # Restore environment files
    cp "$backup_path/.env.production" .env.production
    cp "$backup_path/.env.development" .env.development

    echo "Backup restoration completed"
}

# Main backup process
case "$1" in
    "create")
        # Create backup directory
        backup_path=$(create_backup_dir)

        # Backup database and application
        backup_database "$backup_path"
        backup_application "$backup_path"

        # Verify backup
        if ! verify_backup "$backup_path"; then
            echo "Error: Backup verification failed"
            exit 1
        fi

        # Upload to S3
        upload_to_s3 "$backup_path"

        # Clean up old backups
        cleanup_old_backups

        echo "Backup process completed successfully!"
        ;;

    "restore")
        if [ -z "$2" ]; then
            echo "Error: Please provide backup timestamp"
            exit 1
        fi

        restore_backup "$2"
        ;;

    "list")
        echo "Available backups in S3:"
        aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" | awk {'print $4'}
        ;;

    "verify")
        if [ -z "$2" ]; then
            echo "Error: Please provide backup timestamp"
            exit 1
        fi

        backup_path="$BACKUP_DIR/$2"
        verify_backup "$backup_path"
        ;;

    *)
        echo "Usage: $0 {create|restore|list|verify} [timestamp]"
        exit 1
        ;;
esac
