#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate a secure random string
generate_secure_string() {
    local length=${1:-32}
    openssl rand -base64 "$length" | tr -d '\n' | tr -d '/'
}

# Function to generate a secure password
generate_secure_password() {
    local length=${1:-16}
    openssl rand -base64 "$length" | tr -d '\n' | tr -d '/' | tr -d '+'
}

# Create .env.production file
echo -e "${GREEN}Generating production environment variables...${NC}"

# Database credentials
DB_PASSWORD=$(generate_secure_password 16)
DB_USER="app_user"
DB_NAME="app_db"

# Redis credentials
REDIS_PASSWORD=$(generate_secure_password 16)
REDIS_URL="redis://:${REDIS_PASSWORD}@localhost:6379"

# AWS credentials (these need to be manually set)
echo -e "${YELLOW}Note: AWS credentials need to be manually configured${NC}"
echo -e "${YELLOW}Please enter your AWS credentials when prompted${NC}"
read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "Enter AWS Region (e.g., us-east-1): " AWS_REGION
read -p "Enter ECS Cluster name: " ECS_CLUSTER
read -p "Enter ECS Service name: " ECS_SERVICE
read -p "Enter ALB Target Group ARN: " ALB_TARGET_GROUP
read -p "Enter domain name: " DOMAIN_NAME

# Create .env.production file
cat > .env.production << EOL
# Database Configuration
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_USER=${DB_USER}
POSTGRES_DB=${DB_NAME}

# Redis Configuration
REDIS_URL=${REDIS_URL}

# AWS Configuration
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
ECS_CLUSTER=${ECS_CLUSTER}
ECS_SERVICE=${ECS_SERVICE}
ALB_TARGET_GROUP=${ALB_TARGET_GROUP}

# Application Configuration
DOMAIN_NAME=${DOMAIN_NAME}
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
API_VERSION=v1
CORS_ORIGIN=https://${DOMAIN_NAME}
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOL

# Create .env.development file
echo -e "${GREEN}Generating development environment variables...${NC}"

cat > .env.development << EOL
# Database Configuration
POSTGRES_PASSWORD=dev_password
POSTGRES_USER=dev_user
POSTGRES_DB=dev_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AWS Configuration
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
ECS_CLUSTER=${ECS_CLUSTER}-dev
ECS_SERVICE=${ECS_SERVICE}-dev
ALB_TARGET_GROUP=${ALB_TARGET_GROUP}

# Application Configuration
DOMAIN_NAME=localhost
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000
EOL

# Set proper permissions
chmod 600 .env.production .env.development

# Create a credentials summary file
echo -e "${GREEN}Creating credentials summary...${NC}"
cat > credentials_summary.md << EOL
# Credentials Summary

## Production Environment
- Database Password: ${DB_PASSWORD}
- Database User: ${DB_USER}
- Database Name: ${DB_NAME}
- Redis URL: ${REDIS_URL}
- AWS Region: ${AWS_REGION}
- ECS Cluster: ${ECS_CLUSTER}
- ECS Service: ${ECS_SERVICE}
- Domain: ${DOMAIN_NAME}

## Development Environment
- Database Password: dev_password
- Database User: dev_user
- Database Name: dev_db
- Redis URL: redis://localhost:6379
- AWS Region: ${AWS_REGION}
- ECS Cluster: ${ECS_CLUSTER}-dev
- ECS Service: ${ECS_SERVICE}-dev
- Domain: localhost

## Important Notes
1. Keep these credentials secure and never commit them to version control
2. The .env.production and .env.development files have been created with proper permissions (600)
3. AWS credentials are shared between environments for development purposes
4. Development environment uses simplified credentials for local development
5. Make sure to update the AWS credentials in both files if they change

## Next Steps
1. Review the generated credentials
2. Update any specific values as needed
3. Run verify-env.sh to verify the environment setup
4. Run verify-deployment.sh to verify the deployment configuration
EOL

echo -e "${GREEN}Credentials have been generated successfully!${NC}"
echo -e "${YELLOW}Please review the credentials_summary.md file and update any values as needed${NC}"
echo -e "${GREEN}Next, run: ./scripts/verify-env.sh${NC}"
