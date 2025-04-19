#!/bin/bash

# Exit on error
set -e

# Configuration
LOG_DIR="logs"
ERROR_LOG="$LOG_DIR/error.log"
ALERT_THRESHOLD=10  # Number of errors before alerting
ALERT_INTERVAL=300  # Seconds between alerts (5 minutes)
ALERT_EMAIL="admin@example.com"  # Replace with your email

# Function to count errors in the last hour
count_errors() {
    local current_time=$(date +%s)
    local one_hour_ago=$((current_time - 3600))

    grep -c "ERROR" "$ERROR_LOG" | while read -r line; do
        if [ "$line" -gt "$ALERT_THRESHOLD" ]; then
            echo "High error rate detected: $line errors in the last hour"
            return 1
        fi
    done
}

# Function to send alert
send_alert() {
    local message="$1"
    echo "$message" | mail -s "Log Alert: High Error Rate" "$ALERT_EMAIL"
}

# Main monitoring loop
while true; do
    if count_errors; then
        echo "Error rate within acceptable limits"
    else
        send_alert "High error rate detected in $ERROR_LOG. Please check the logs for details."
    fi

    sleep "$ALERT_INTERVAL"
done
