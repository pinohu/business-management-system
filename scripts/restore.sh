#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a backup file path${NC}"
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"
TEMP_DIR="./restore_temp"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found${NC}"
    exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo -e "${YELLOW}Starting restore process...${NC}"

# Extract backup
echo -e "${YELLOW}Extracting backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Stop services
echo -e "${YELLOW}Stopping services...${NC}"
docker-compose down

# Restore volumes
echo -e "${YELLOW}Restoring volumes...${NC}"
docker run --rm -v freelance-dashboard_postgres_data:/target -v "$TEMP_DIR:/backup" alpine sh -c "cd /target && tar xzf /backup/postgres_data.tar.gz"
docker run --rm -v freelance-dashboard_redis_data:/target -v "$TEMP_DIR:/backup" alpine sh -c "cd /target && tar xzf /backup/redis_data.tar.gz"
docker run --rm -v freelance-dashboard_elasticsearch_data:/target -v "$TEMP_DIR:/backup" alpine sh -c "cd /target && tar xzf /backup/elasticsearch_data.tar.gz"
docker run --rm -v freelance-dashboard_grafana_data:/target -v "$TEMP_DIR:/backup" alpine sh -c "cd /target && tar xzf /backup/grafana_data.tar.gz"

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Restore PostgreSQL database
echo -e "${YELLOW}Restoring PostgreSQL database...${NC}"
docker-compose exec -T db psql -U postgres -d freelance_dashboard < "$TEMP_DIR/database.sql"

# Restore Redis data
echo -e "${YELLOW}Restoring Redis data...${NC}"
docker cp "$TEMP_DIR/redis/." $(docker-compose ps -q redis):/data
docker-compose exec redis redis-cli SHUTDOWN
docker-compose up -d redis

# Restore configuration files
echo -e "${YELLOW}Restoring configuration files...${NC}"
cp "$TEMP_DIR/docker-compose.yml" ./
cp "$TEMP_DIR/docker-compose.prod.yml" ./
cp -r "$TEMP_DIR/docker" ./
cp -r "$TEMP_DIR/prometheus" ./
cp -r "$TEMP_DIR/promtail" ./
cp "$TEMP_DIR/tempo.yaml" ./
cp "$TEMP_DIR/config.hcl" ./vault/
cp "$TEMP_DIR/.env.development" ./
cp "$TEMP_DIR/.env.production" ./

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "${YELLOW}Please restart the services to apply all changes:${NC}"
echo "docker-compose down && docker-compose up -d" 