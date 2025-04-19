#!/bin/bash

# Exit on error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
for cmd in docker docker-compose; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
MONITORING_DIR="monitoring"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create monitoring directory
mkdir -p "$MONITORING_DIR"

# Create Prometheus configuration
cat > "$MONITORING_DIR/prometheus.yml" << 'EOL'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
EOL

# Create Prometheus alert rules
cat > "$MONITORING_DIR/rules/alerts.yml" << 'EOL'
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is above 10% for the last 5 minutes"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency detected
          description: "95th percentile latency is above 1 second"

      - alert: HighDatabaseConnections
        expr: pg_connections > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High database connections
          description: "Database connections are above 80"

      - alert: HighRedisMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High Redis memory usage
          description: "Redis memory usage is above 80%"

  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage
          description: "CPU usage is above 80%"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: "Memory usage is above 80%"

      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High disk usage
          description: "Disk usage is above 80%"
EOL

# Create Alertmanager configuration
cat > "$MONITORING_DIR/alertmanager.yml" << 'EOL'
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        send_resolved: true
        title: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
        text: |
          *Alert:* {{ .GroupLabels.alertname }}
          *Description:* {{ .CommonAnnotations.description }}
          *Severity:* {{ .CommonLabels.severity }}
          *Instance:* {{ .CommonLabels.instance }}
          *Started:* {{ .StartsAt | since }}
          {{ if .EndsAt }}*Ended:* {{ .EndsAt | since }}{{ end }}
        actions:
          - type: button
            text: 'View in Grafana'
            url: '{{ .CommonAnnotations.grafana_url }}'
EOL

# Create Grafana datasource configuration
cat > "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml" << 'EOL'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    version: 1
    jsonData:
      timeInterval: "15s"
EOL

# Create Grafana dashboard
cat > "$MONITORING_DIR/grafana/provisioning/dashboards/app.json" << 'EOL'
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "expr": "rate(http_requests_total[5m])",
          "interval": "",
          "legendFormat": "{{method}} {{route}}",
          "refId": "A"
        }
      ],
      "title": "HTTP Request Rate",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Application Dashboard",
  "version": 0,
  "weekStart": ""
}
EOL

# Create docker-compose file for monitoring
cat > "$MONITORING_DIR/docker-compose.yml" << 'EOL'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    ports:
      - "9093:9093"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
    networks:
      - monitoring

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    environment:
      - REDIS_ADDR=redis://redis:6379
    ports:
      - "9121:9121"
    networks:
      - monitoring

volumes:
  prometheus_data:
  alertmanager_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
EOL

# Create environment file for monitoring
cat > "$MONITORING_DIR/.env" << 'EOL'
GRAFANA_ADMIN_PASSWORD=your-secure-password
EOL

# Start monitoring services
cd "$MONITORING_DIR"
docker-compose up -d

echo "Monitoring setup completed successfully!"
echo "Access the monitoring services at:"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/your-secure-password)"
echo "Alertmanager: http://localhost:9093"
echo "Node Exporter: http://localhost:9100"
echo "cAdvisor: http://localhost:8080"
echo "Redis Exporter: http://localhost:9121"
