#!/bin/bash

# Exit on error
set -e

# Create logs directory if it doesn't exist
mkdir -p logs

# Set proper permissions
chmod 755 logs

# Create log files if they don't exist
touch logs/error.log logs/combined.log

# Set proper permissions for log files
chmod 644 logs/*.log

# Ensure the application user has write permissions
# Replace APP_USER with your application user
chown -R APP_USER:APP_USER logs

echo "Log directory setup completed successfully"
