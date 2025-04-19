#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.production

# Setup logs directory
echo "Setting up logs directory..."
./scripts/setup-logs.sh

# Setup log monitoring service
echo "Setting up log monitoring service..."
sudo cp scripts/monitor-logs.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/monitor-logs.sh

# Create systemd service for log monitoring
cat << EOF | sudo tee /etc/systemd/system/log-monitor.service
[Unit]
Description=Log Monitoring Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/monitor-logs.sh
Restart=always
User=APP_USER

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start the service
sudo systemctl daemon-reload
sudo systemctl enable log-monitor
sudo systemctl start log-monitor

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
for cmd in docker docker-compose openssl certbot; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Generate secure secrets if they don't exist
if [ ! -f "secrets/jwt.env" ]; then
    echo "Generating secure secrets..."
    ./scripts/generate-secrets.sh
fi

# Load secrets
for secret_file in secrets/*.env; do
    if [ -f "$secret_file" ]; then
        source "$secret_file"
    fi
done

# Set up SSL certificates
echo "Setting up SSL certificates..."
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    ./scripts/setup-ssl.sh "${DOMAIN}"
fi

# Create backup directory
echo "Setting up backup directory..."
mkdir -p "${BACKUP_PATH}"

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Backup database
echo "Backing up database..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${BACKUP_PATH}/backup_$(date +%Y%m%d_%H%M%S).sql"

# Clean up old backups
echo "Cleaning up old backups..."
find "${BACKUP_PATH}" -type f -name "backup_*.sql" -mtime +"${BACKUP_RETENTION_DAYS}" -delete

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
for service in frontend backend db redis prometheus grafana nginx; do
    echo "Waiting for $service to be healthy..."
    until docker-compose -f docker-compose.prod.yml ps $service | grep -q "healthy"; do
        sleep 5
    done
done

# Initialize database
echo "Initializing database..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate

# Set up monitoring
echo "Setting up monitoring..."
./scripts/setup-monitoring.sh

# Verify backup
echo "Verifying backup..."
./scripts/backup-verify.sh

# Set up backup schedule
echo "Setting up backup schedule..."
(crontab -l 2>/dev/null | grep -v "pg_dump") | crontab -
(crontab -l 2>/dev/null; echo "${BACKUP_SCHEDULE} docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > ${BACKUP_PATH}/backup_\$(date +%Y%m%d_%H%M%S).sql") | crontab -

# Set up backup verification schedule
(crontab -l 2>/dev/null; echo "${BACKUP_VERIFY_SCHEDULE} ${PWD}/scripts/backup-verify.sh") | crontab -

# Set up log rotation
echo "Setting up log rotation..."
cat > /etc/logrotate.d/docker << EOF
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF

# Enable and start log rotation
systemctl enable logrotate
systemctl start logrotate

# Set up firewall rules
echo "Setting up firewall rules..."
if command_exists ufw; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 8000/tcp
    ufw allow 9090/tcp
    ufw allow 3000/tcp
    ufw enable
fi

# Set up monitoring alerts
echo "Setting up monitoring alerts..."
docker-compose -f docker-compose.prod.yml exec -T prometheus promtool check rules /etc/prometheus/rules/*.yml

# Verify deployment
echo "Verifying deployment..."
curl -f "https://${DOMAIN}/health" || exit 1
curl -f "https://api.${DOMAIN}/api/health" || exit 1

# Run security scan
echo "Running security scan..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run security:scan

# Check SSL certificate
echo "Checking SSL certificate..."
certbot certificates --domain "${DOMAIN}"

echo "Deployment completed successfully!"
