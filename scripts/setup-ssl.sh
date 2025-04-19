#!/bin/bash

# Exit on error
set -e

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@${DOMAIN}"  # You can change this email

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Create nginx configuration for the domain
cat > /etc/nginx/conf.d/${DOMAIN}.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

# Create directory for ACME challenge
mkdir -p /var/www/certbot

# Obtain SSL certificate
echo "Obtaining SSL certificate for ${DOMAIN}..."
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --domain ${DOMAIN} \
    --redirect

# Create renewal script
cat > /etc/cron.weekly/certbot-renewal << EOF
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

chmod +x /etc/cron.weekly/certbot-renewal

echo "SSL certificate setup completed successfully!"
echo "Certificate will be automatically renewed weekly."
