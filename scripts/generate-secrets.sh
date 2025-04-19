#!/bin/bash

# Exit on error
set -e

# Create secrets directory if it doesn't exist
mkdir -p secrets

# Generate JWT secret
echo "Generating JWT secret..."
openssl rand -base64 32 > secrets/jwt.env

# Generate Redis password
echo "Generating Redis password..."
openssl rand -base64 32 > secrets/redis.env

# Generate Grafana admin password
echo "Generating Grafana admin password..."
openssl rand -base64 32 > secrets/grafana.env

# Generate database password
echo "Generating database password..."
openssl rand -base64 32 > secrets/db.env

# Set proper permissions
chmod 600 secrets/*.env

# Create a summary file
echo "Secrets generated successfully!" > secrets/README.md
echo "DO NOT commit these files to version control!" >> secrets/README.md
echo "" >> secrets/README.md
echo "Generated files:" >> secrets/README.md
echo "- jwt.env: JWT secret for authentication" >> secrets/README.md
echo "- redis.env: Redis password" >> secrets/README.md
echo "- grafana.env: Grafana admin password" >> secrets/README.md
echo "- db.env: Database password" >> secrets/README.md

echo "Secrets have been generated successfully!"
echo "Please make sure to update your .env.production file with these values."
