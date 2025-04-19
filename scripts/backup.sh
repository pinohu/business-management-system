#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Backup MongoDB
echo "Backing up MongoDB..."
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --out /backup

# Backup Redis
echo "Backing up Redis..."
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli SAVE

# Create backup archive
echo "Creating backup archive..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    -C /backup \
    mongodb \
    redis \
    uploads \
    .env

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find "${BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" 