#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check service health
check_service() {
    local service=$1
    local port=$2
    local url=$3
    local name=$4

    echo -e "${YELLOW}Checking $name...${NC}"
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✓ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not healthy${NC}"
        return 1
    fi
}

# Function to check container status
check_container() {
    local container=$1
    local status=$(docker-compose ps $container --format json | jq -r '.[0].Status')
    
    if [[ $status == *"Up"* ]]; then
        echo -e "${GREEN}✓ $container is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $container is not running${NC}"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Database is not healthy${NC}"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    echo -e "${YELLOW}Checking Redis connection...${NC}"
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✓ Redis is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Redis is not healthy${NC}"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    echo -e "${YELLOW}Checking disk space...${NC}"
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$usage" -lt 90 ]; then
        echo -e "${GREEN}✓ Disk space is healthy ($usage% used)${NC}"
        return 0
    else
        echo -e "${RED}✗ Disk space is low ($usage% used)${NC}"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    echo -e "${YELLOW}Checking memory usage...${NC}"
    local usage=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)
    if [ "$usage" -lt 90 ]; then
        echo -e "${GREEN}✓ Memory usage is healthy ($usage% used)${NC}"
        return 0
    else
        echo -e "${RED}✗ Memory usage is high ($usage% used)${NC}"
        return 1
    fi
}

# Main health check
echo -e "${YELLOW}Starting health check...${NC}"

# Check containers
check_container "app"
check_container "db"
check_container "redis"
check_container "prometheus"
check_container "grafana"
check_container "elasticsearch"
check_container "kibana"
check_container "vault"

# Check services
check_service "app" "3000" "http://localhost:3000/api/health" "Application"
check_service "prometheus" "9090" "http://localhost:9090/-/healthy" "Prometheus"
check_service "grafana" "3001" "http://localhost:3001/api/health" "Grafana"
check_service "elasticsearch" "9200" "http://localhost:9200/_cluster/health" "Elasticsearch"
check_service "kibana" "5601" "http://localhost:5601/api/status" "Kibana"
check_service "vault" "8200" "http://localhost:8200/v1/sys/health" "Vault"

# Check connections
check_database
check_redis

# Check system resources
check_disk_space
check_memory

echo -e "${YELLOW}Health check completed${NC}" 