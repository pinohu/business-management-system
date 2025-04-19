#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a variable is set
check_variable() {
    local var_name=$1
    local var_value=${!var_name}

    if [ -z "$var_value" ]; then
        echo -e "${RED}Error: $var_name is not set${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ $var_name is set${NC}"
    return 0
}

# Function to create a backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/$timestamp"

    echo -e "${GREEN}Creating backup...${NC}"

    # Create backup directory
    mkdir -p "$backup_dir"

    # Backup database
    echo -e "${YELLOW}Backing up database...${NC}"
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$backup_dir/database.sql"

    # Backup environment files
    echo -e "${YELLOW}Backing up environment files...${NC}"
    cp .env.production "$backup_dir/"
    cp .env.development "$backup_dir/"

    # Backup Docker volumes
    echo -e "${YELLOW}Backing up Docker volumes...${NC}"
    docker run --rm -v app_data:/data -v "$backup_dir":/backup alpine tar czf /backup/volumes.tar.gz -C /data .

    echo -e "${GREEN}Backup created successfully in $backup_dir${NC}"
}

# Function to build Docker images
build_images() {
    echo -e "${GREEN}Building Docker images...${NC}"

    # Build frontend
    echo -e "${YELLOW}Building frontend image...${NC}"
    docker build -t app-frontend:latest -f frontend/Dockerfile frontend/

    # Build backend
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t app-backend:latest -f backend/Dockerfile backend/

    echo -e "${GREEN}Docker images built successfully${NC}"
}

# Function to push images to ECR
push_to_ecr() {
    echo -e "${GREEN}Pushing images to ECR...${NC}"

    # Get ECR login token
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

    # Tag and push frontend
    docker tag app-frontend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/app-frontend:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/app-frontend:latest"

    # Tag and push backend
    docker tag app-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/app-backend:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/app-backend:latest"

    echo -e "${GREEN}Images pushed to ECR successfully${NC}"
}

# Function to update ECS service
update_ecs_service() {
    echo -e "${GREEN}Updating ECS service...${NC}"

    # Force new deployment
    aws ecs update-service --cluster "$ECS_CLUSTER" --service "$ECS_SERVICE" --force-new-deployment

    # Wait for deployment to complete
    echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
    aws ecs wait services-stable --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE"

    echo -e "${GREEN}ECS service updated successfully${NC}"
}

# Function to verify deployment
verify_deployment() {
    echo -e "${GREEN}Verifying deployment...${NC}"

    # Check service health
    local health_url="https://$DOMAIN_NAME/health"
    echo -e "${YELLOW}Checking service health at $health_url...${NC}"

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$health_url" | grep -q "ok"; then
            echo -e "${GREEN}Service is healthy${NC}"
            return 0
        fi

        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Service not healthy yet${NC}"
        sleep 10
        attempt=$((attempt + 1))
    done

    echo -e "${RED}Service failed to become healthy${NC}"
    return 1
}

# Function to rollback deployment
rollback_deployment() {
    echo -e "${RED}Rolling back deployment...${NC}"

    # Stop current deployment
    aws ecs update-service --cluster "$ECS_CLUSTER" --service "$ECS_SERVICE" --desired-count 0

    # Wait for tasks to drain
    aws ecs wait services-stable --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE"

    # Restore from backup
    local latest_backup=$(ls -td backups/*/ | head -1)
    if [ -z "$latest_backup" ]; then
        echo -e "${RED}No backup found for rollback${NC}"
        return 1
    fi

    # Restore database
    echo -e "${YELLOW}Restoring database...${NC}"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$latest_backup/database.sql"

    # Restore environment files
    echo -e "${YELLOW}Restoring environment files...${NC}"
    cp "$latest_backup/.env.production" .env.production
    cp "$latest_backup/.env.development" .env.development

    # Restore Docker volumes
    echo -e "${YELLOW}Restoring Docker volumes...${NC}"
    docker run --rm -v app_data:/data -v "$latest_backup":/backup alpine sh -c "cd /data && tar xzf /backup/volumes.tar.gz"

    # Restart service
    aws ecs update-service --cluster "$ECS_CLUSTER" --service "$ECS_SERVICE" --desired-count 1

    echo -e "${GREEN}Rollback completed${NC}"
}

# Main deployment process
echo -e "${GREEN}Starting deployment process...${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
for cmd in docker aws curl psql; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}Error: $cmd is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ $cmd is installed${NC}"
done

# Check required environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"
required_vars=(
    "POSTGRES_PASSWORD"
    "POSTGRES_USER"
    "POSTGRES_DB"
    "ECS_CLUSTER"
    "ECS_SERVICE"
    "ALB_TARGET_GROUP"
    "DOMAIN_NAME"
    "AWS_REGION"
    "AWS_ACCOUNT_ID"
)

for var in "${required_vars[@]}"; do
    if ! check_variable "$var"; then
        exit 1
    fi
done

# Create backup
create_backup

# Build and push Docker images
build_images
push_to_ecr

# Update ECS service
update_ecs_service

# Verify deployment
if ! verify_deployment; then
    echo -e "${RED}Deployment verification failed${NC}"
    rollback_deployment
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is now live at https://$DOMAIN_NAME${NC}"
