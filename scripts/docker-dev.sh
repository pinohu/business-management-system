#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_message "Docker is not running. Please start Docker first." "$RED"
        exit 1
    fi
}

# Function to build and start containers
start_dev() {
    print_message "Starting development environment..." "$GREEN"
    docker-compose up --build -d
    print_message "Development environment is ready!" "$GREEN"
    print_message "Access the application at http://localhost:3000" "$YELLOW"
}

# Function to stop containers
stop_dev() {
    print_message "Stopping development environment..." "$YELLOW"
    docker-compose down
    print_message "Development environment stopped." "$GREEN"
}

# Function to restart containers
restart_dev() {
    print_message "Restarting development environment..." "$YELLOW"
    docker-compose restart
    print_message "Development environment restarted." "$GREEN"
}

# Function to show logs
show_logs() {
    print_message "Showing logs..." "$YELLOW"
    docker-compose logs -f
}

# Function to run database migrations
run_migrations() {
    print_message "Running database migrations..." "$YELLOW"
    docker-compose exec app npx prisma migrate deploy
    print_message "Migrations completed." "$GREEN"
}

# Function to seed the database
seed_database() {
    print_message "Seeding database..." "$YELLOW"
    docker-compose exec app npx prisma db seed
    print_message "Database seeded." "$GREEN"
}

# Function to show help
show_help() {
    echo "Usage: ./docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the development environment"
    echo "  stop      - Stop the development environment"
    echo "  restart   - Restart the development environment"
    echo "  logs      - Show logs from all containers"
    echo "  migrate   - Run database migrations"
    echo "  seed      - Seed the database"
    echo "  help      - Show this help message"
}

# Check if Docker is running
check_docker

# Handle commands
case "$1" in
    "start")
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "restart")
        restart_dev
        ;;
    "logs")
        show_logs
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_message "Unknown command: $1" "$RED"
        show_help
        exit 1
        ;;
esac 