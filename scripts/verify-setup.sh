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

# Function to check AWS CLI configuration
check_aws_config() {
    echo -e "\n${GREEN}Checking AWS CLI configuration...${NC}"

    if ! aws configure list > /dev/null 2>&1; then
        echo -e "${RED}Error: AWS CLI is not configured${NC}"
        return 1
    fi

    # Verify AWS credentials
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        echo -e "${RED}Error: AWS credentials are invalid${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ AWS CLI is configured correctly${NC}"
    return 0
}

# Function to check ECS cluster
check_ecs_cluster() {
    echo -e "\n${GREEN}Checking ECS cluster...${NC}"

    local cluster_name="$ECS_CLUSTER"
    if [ -z "$cluster_name" ]; then
        echo -e "${RED}Error: ECS_CLUSTER not set${NC}"
        return 1
    fi

    if ! aws ecs describe-clusters --clusters "$cluster_name" > /dev/null 2>&1; then
        echo -e "${RED}Error: ECS cluster '$cluster_name' not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ ECS cluster '$cluster_name' exists${NC}"
    return 0
}

# Function to check ECS service
check_ecs_service() {
    echo -e "\n${GREEN}Checking ECS service...${NC}"

    local cluster_name="$ECS_CLUSTER"
    local service_name="$ECS_SERVICE"

    if [ -z "$service_name" ]; then
        echo -e "${RED}Error: ECS_SERVICE not set${NC}"
        return 1
    fi

    if ! aws ecs describe-services --cluster "$cluster_name" --services "$service_name" > /dev/null 2>&1; then
        echo -e "${RED}Error: ECS service '$service_name' not found in cluster '$cluster_name'${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ ECS service '$service_name' exists${NC}"
    return 0
}

# Function to check ALB target group
check_alb_target_group() {
    echo -e "\n${GREEN}Checking ALB target group...${NC}"

    local target_group="$ALB_TARGET_GROUP"
    if [ -z "$target_group" ]; then
        echo -e "${RED}Error: ALB_TARGET_GROUP not set${NC}"
        return 1
    fi

    if ! aws elbv2 describe-target-groups --target-group-arns "$target_group" > /dev/null 2>&1; then
        echo -e "${RED}Error: ALB target group '$target_group' not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ ALB target group exists${NC}"
    return 0
}

# Function to check RDS database
check_rds_database() {
    echo -e "\n${GREEN}Checking RDS database...${NC}"

    local db_instance="$POSTGRES_DB"
    if [ -z "$db_instance" ]; then
        echo -e "${RED}Error: POSTGRES_DB not set${NC}"
        return 1
    fi

    if ! aws rds describe-db-instances --db-instance-identifier "$db_instance" > /dev/null 2>&1; then
        echo -e "${RED}Error: RDS instance '$db_instance' not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ RDS database exists${NC}"
    return 0
}

# Function to check ElastiCache Redis
check_redis() {
    echo -e "\n${GREEN}Checking Redis connection...${NC}"

    if [ -z "$REDIS_URL" ]; then
        echo -e "${RED}Error: REDIS_URL not set${NC}"
        return 1
    fi

    if ! redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
        echo -e "${RED}Error: Cannot connect to Redis${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Redis connection successful${NC}"
    return 0
}

# Function to check SSL certificate
check_ssl() {
    echo -e "\n${GREEN}Checking SSL certificate...${NC}"

    local domain="$DOMAIN_NAME"
    if [ -z "$domain" ]; then
        echo -e "${RED}Error: DOMAIN_NAME not set${NC}"
        return 1
    fi

    if ! openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        echo -e "${RED}Error: SSL certificate not found for $domain${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ SSL certificate exists${NC}"
    return 0
}

# Function to check environment variables
check_env_vars() {
    echo -e "\n${GREEN}Checking environment variables...${NC}"

    local required_vars=(
        "POSTGRES_PASSWORD"
        "POSTGRES_USER"
        "POSTGRES_DB"
        "ECS_CLUSTER"
        "ECS_SERVICE"
        "ALB_TARGET_GROUP"
        "DOMAIN_NAME"
        "REDIS_URL"
        "AWS_REGION"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
    )

    local missing_vars=0
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}Error: $var is not set${NC}"
            missing_vars=$((missing_vars + 1))
        else
            if [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"KEY"* ]]; then
                echo -e "${GREEN}✓ $var is set (value: ********)${NC}"
            else
                echo -e "${GREEN}✓ $var is set (value: ${!var})${NC}"
            fi
        fi
    done

    if [ $missing_vars -gt 0 ]; then
        return 1
    fi

    return 0
}

# Main verification process
echo -e "${GREEN}Starting comprehensive setup verification...${NC}"

# Check AWS configuration
if ! check_aws_config; then
    exit 1
fi

# Check environment variables
if ! check_env_vars; then
    exit 1
fi

# Check ECS cluster
if ! check_ecs_cluster; then
    exit 1
fi

# Check ECS service
if ! check_ecs_service; then
    exit 1
fi

# Check ALB target group
if ! check_alb_target_group; then
    exit 1
fi

# Check RDS database
if ! check_rds_database; then
    exit 1
fi

# Check Redis connection
if ! check_redis; then
    exit 1
fi

# Check SSL certificate
if ! check_ssl; then
    exit 1
fi

echo -e "\n${GREEN}All components verified successfully!${NC}"
echo -e "${GREEN}Your setup is ready for deployment.${NC}"
