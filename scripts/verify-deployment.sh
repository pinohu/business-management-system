#!/bin/bash

# Exit on error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
for cmd in curl jq aws; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
HEALTH_CHECK_ENDPOINT="/health"
PERFORMANCE_THRESHOLD=1000 # milliseconds
ERROR_RATE_THRESHOLD=0.01 # 1%
TIMEOUT=5 # seconds

# Function to check service health
check_health() {
    local service=$1
    local url=$2

    echo "Checking health of $service..."

    if ! curl -s -f --max-time $TIMEOUT "$url$HEALTH_CHECK_ENDPOINT" | grep -q "ok"; then
        echo "Error: $service health check failed"
        return 1
    fi

    echo "✓ $service is healthy"
    return 0
}

# Function to check service performance
check_performance() {
    local service=$1
    local url=$2

    echo "Checking performance of $service..."

    local start_time=$(date +%s%N)
    local response=$(curl -s -f --max-time $TIMEOUT "$url$HEALTH_CHECK_ENDPOINT")
    local end_time=$(date +%s%N)

    local duration=$(( ($end_time - $start_time) / 1000000 )) # Convert to milliseconds

    if [ $duration -gt $PERFORMANCE_THRESHOLD ]; then
        echo "Error: $service response time ($duration ms) exceeds threshold ($PERFORMANCE_THRESHOLD ms)"
        return 1
    fi

    echo "✓ $service performance is within threshold"
    return 0
}

# Function to check error rates
check_error_rates() {
    local service=$1
    local url=$2

    echo "Checking error rates for $service..."

    # Get total requests and error requests from Prometheus
    local total_requests=$(curl -s "$url/metrics" | grep "http_requests_total" | awk '{print $2}')
    local error_requests=$(curl -s "$url/metrics" | grep "http_requests_total{status=~\"5..\"}" | awk '{print $2}')

    if [ -z "$total_requests" ] || [ -z "$error_requests" ]; then
        echo "Error: Could not retrieve metrics for $service"
        return 1
    fi

    local error_rate=$(echo "scale=4; $error_requests / $total_requests" | bc)

    if (( $(echo "$error_rate > $ERROR_RATE_THRESHOLD" | bc -l) )); then
        echo "Error: $service error rate ($error_rate) exceeds threshold ($ERROR_RATE_THRESHOLD)"
        return 1
    fi

    echo "✓ $service error rate is within threshold"
    return 0
}

# Function to check database connectivity
check_database() {
    echo "Checking database connectivity..."

    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "Error: Database connection failed"
        return 1
    fi

    echo "✓ Database connection successful"
    return 0
}

# Function to check Redis connectivity
check_redis() {
    echo "Checking Redis connectivity..."

    if ! redis-cli ping > /dev/null 2>&1; then
        echo "Error: Redis connection failed"
        return 1
    fi

    echo "✓ Redis connection successful"
    return 0
}

# Function to check AWS service health
check_aws_services() {
    echo "Checking AWS service health..."

    # Check ECS service
    local ecs_status=$(aws ecs describe-services --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE" --query 'services[0].status' --output text)
    if [ "$ecs_status" != "ACTIVE" ]; then
        echo "Error: ECS service is not active (status: $ecs_status)"
        return 1
    fi

    # Check ALB health
    local alb_status=$(aws elbv2 describe-target-health --target-group-arn "$ALB_TARGET_GROUP" --query 'TargetHealthDescriptions[0].TargetHealth.State' --output text)
    if [ "$alb_status" != "healthy" ]; then
        echo "Error: ALB target is not healthy (status: $alb_status)"
        return 1
    fi

    echo "✓ AWS services are healthy"
    return 0
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1

    echo "Checking SSL certificate for $domain..."

    local cert_info=$(openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates)

    if [ -z "$cert_info" ]; then
        echo "Error: Could not retrieve SSL certificate information"
        return 1
    fi

    local expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local now_epoch=$(date +%s)
    local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))

    if [ $days_left -lt 30 ]; then
        echo "Warning: SSL certificate expires in $days_left days"
    fi

    echo "✓ SSL certificate is valid"
    return 0
}

# Main verification process
echo "Starting deployment verification..."

# Check frontend
if ! check_health "frontend" "http://localhost:3000"; then
    exit 1
fi

if ! check_performance "frontend" "http://localhost:3000"; then
    exit 1
fi

# Check backend
if ! check_health "backend" "http://localhost:3001"; then
    exit 1
fi

if ! check_performance "backend" "http://localhost:3001"; then
    exit 1
fi

if ! check_error_rates "backend" "http://localhost:3001"; then
    exit 1
fi

# Check database
if ! check_database; then
    exit 1
fi

# Check Redis
if ! check_redis; then
    exit 1
fi

# Check AWS services
if ! check_aws_services; then
    exit 1
fi

# Check SSL certificate
if ! check_ssl "$DOMAIN_NAME"; then
    exit 1
fi

echo "Deployment verification completed successfully!"
