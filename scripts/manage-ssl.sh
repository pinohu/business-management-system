#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.production

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
for cmd in certbot openssl; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
SSL_DIR="/etc/letsencrypt/live"
DOMAIN="$DOMAIN_NAME"
EMAIL="$SSL_EMAIL"
RENEWAL_THRESHOLD=30 # days

# Function to check certificate expiration
check_expiration() {
    local cert_file="$SSL_DIR/$DOMAIN/fullchain.pem"
    if [ -f "$cert_file" ]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local now_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))
        echo "$days_left"
    else
        echo "0"
    fi
}

# Function to obtain new certificate
obtain_certificate() {
    echo "Obtaining new SSL certificate for $DOMAIN..."
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domain "$DOMAIN" \
        --redirect \
        --hsts \
        --staple-ocsp \
        --must-staple
}

# Function to renew certificate
renew_certificate() {
    echo "Renewing SSL certificate..."
    certbot renew --non-interactive
}

# Function to verify certificate
verify_certificate() {
    local cert_file="$SSL_DIR/$DOMAIN/fullchain.pem"
    if [ -f "$cert_file" ]; then
        echo "Verifying certificate..."
        openssl x509 -in "$cert_file" -noout -text | grep -A2 "Validity"
        return 0
    else
        echo "Certificate file not found"
        return 1
    fi
}

# Main process
echo "Starting SSL certificate management..."

# Check if certificate exists
if [ ! -d "$SSL_DIR/$DOMAIN" ]; then
    echo "No certificate found. Obtaining new certificate..."
    obtain_certificate
else
    # Check expiration
    days_left=$(check_expiration)
    if [ "$days_left" -lt "$RENEWAL_THRESHOLD" ]; then
        echo "Certificate expires in $days_left days. Renewing..."
        renew_certificate
    else
        echo "Certificate is valid for $days_left more days."
    fi
fi

# Verify certificate
if verify_certificate; then
    echo "Certificate verification successful!"

    # Copy certificates to application directory
    echo "Copying certificates to application directory..."
    mkdir -p "backend/ssl"
    cp "$SSL_DIR/$DOMAIN/fullchain.pem" "backend/ssl/"
    cp "$SSL_DIR/$DOMAIN/privkey.pem" "backend/ssl/"

    # Set proper permissions
    chmod 600 "backend/ssl/privkey.pem"
    chmod 644 "backend/ssl/fullchain.pem"

    echo "SSL certificate management completed successfully!"
else
    echo "Error: Certificate verification failed"
    exit 1
fi
