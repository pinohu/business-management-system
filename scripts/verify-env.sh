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
    local is_required=${2:-true}

    if [ -z "$var_value" ]; then
        if [ "$is_required" = true ]; then
            echo -e "${RED}Error: $var_name is not set${NC}"
            return 1
        else
            echo -e "${YELLOW}Warning: Optional variable $var_name is not set${NC}"
            return 0
        fi
    fi

    # Mask sensitive values in output
    if [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"KEY"* ]]; then
        echo -e "${GREEN}✓ $var_name is set (value: ********)${NC}"
    else
        echo -e "${GREEN}✓ $var_name is set (value: $var_value)${NC}"
    fi
    return 0
}

# Function to load environment variables from file
load_env_file() {
    local env_file=$1

    if [ -f "$env_file" ]; then
        echo -e "${GREEN}Loading environment variables from $env_file...${NC}"
        set -a
        source "$env_file"
        set +a
    else
        echo -e "${YELLOW}Warning: $env_file not found${NC}"
    fi
}

# Function to validate URL format
validate_url() {
    local url=$1
    if [[ ! $url =~ ^https?:// ]]; then
        echo -e "${RED}Error: Invalid URL format for $url${NC}"
        return 1
    fi
    return 0
}

# Function to validate AWS region
validate_aws_region() {
    local region=$1
    local valid_regions=$(aws ec2 describe-regions --query 'Regions[].RegionName' --output text)
    if [[ ! $valid_regions =~ $region ]]; then
        echo -e "${RED}Error: Invalid AWS region: $region${NC}"
        return 1
    fi
    return 0
}

# Required environment variables
REQUIRED_VARS=(
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

# Optional environment variables
OPTIONAL_VARS=(
    "NODE_ENV"
    "PORT"
    "LOG_LEVEL"
    "API_VERSION"
    "CORS_ORIGIN"
    "RATE_LIMIT_WINDOW"
    "RATE_LIMIT_MAX"
)

# Load environment files
load_env_file ".env.production"
load_env_file ".env.development"

# Check if required commands are installed
echo -e "\n${GREEN}Checking required commands...${NC}"
for cmd in curl jq aws psql redis-cli openssl docker docker-compose; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}Error: $cmd is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ $cmd is installed${NC}"
done

# Verify Docker is running
echo -e "\n${GREEN}Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Verify AWS credentials
echo -e "\n${GREEN}Verifying AWS credentials...${NC}"
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials are invalid or not configured${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials are valid${NC}"

# Validate AWS region if set
if [ ! -z "$AWS_REGION" ]; then
    if ! validate_aws_region "$AWS_REGION"; then
        exit 1
    fi
fi

# Check required environment variables
echo -e "\n${GREEN}Checking required environment variables...${NC}"
MISSING_VARS=0
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_variable "$var" true; then
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

# Check optional environment variables
echo -e "\n${GREEN}Checking optional environment variables...${NC}"
for var in "${OPTIONAL_VARS[@]}"; do
    check_variable "$var" false
done

# Validate URLs if set
if [ ! -z "$REDIS_URL" ]; then
    if ! validate_url "$REDIS_URL"; then
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
fi

# Check file permissions
echo -e "\n${GREEN}Checking file permissions...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -x "$SCRIPT_DIR/verify-deployment.sh" ]; then
    echo -e "${YELLOW}Warning: verify-deployment.sh is not executable${NC}"
    echo -e "${GREEN}Running: chmod +x $SCRIPT_DIR/verify-deployment.sh${NC}"
    chmod +x "$SCRIPT_DIR/verify-deployment.sh"
fi

# Check disk space
echo -e "\n${GREEN}Checking disk space...${NC}"
DISK_SPACE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_SPACE" -gt 90 ]; then
    echo -e "${RED}Warning: Disk space is critically low ($DISK_SPACE% used)${NC}"
fi

# Check memory
echo -e "\n${GREEN}Checking system memory...${NC}"
FREE_MEM=$(free -m | awk 'NR==2 {print $4}')
if [ "$FREE_MEM" -lt 1024 ]; then
    echo -e "${YELLOW}Warning: Less than 1GB of free memory available${NC}"
fi

# Summary
echo -e "\n${GREEN}Environment verification summary:${NC}"
if [ $MISSING_VARS -eq 0 ]; then
    echo -e "${GREEN}✓ All required environment variables are set${NC}"
else
    echo -e "${RED}✗ $MISSING_VARS required environment variables are missing${NC}"
    echo -e "${YELLOW}Please set the missing variables in your .env.production file${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required commands are installed${NC}"
echo -e "${GREEN}✓ Docker is running${NC}"
echo -e "${GREEN}✓ AWS credentials are valid${NC}"
echo -e "${GREEN}✓ Script permissions are correct${NC}"

echo -e "\n${GREEN}Environment verification completed successfully!${NC}"
echo -e "${GREEN}You can now run verify-deployment.sh${NC}"
