#!/bin/bash

# Exit on error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
for cmd in git gh; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is not installed"
        exit 1
    fi
done

# Configuration
WORKFLOW_DIR=".github/workflows"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create GitHub Actions workflow directory
mkdir -p "$WORKFLOW_DIR"

# Create main CI workflow
cat > "$WORKFLOW_DIR/ci.yml" << 'EOL'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Run linting
        run: |
          npm run lint
          cd backend && npm run lint

      - name: Run tests
        run: |
          npm test
          cd backend && npm test

      - name: Run type checking
        run: |
          npm run type-check
          cd backend && npm run type-check

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Run security audit
        run: |
          npm audit
          cd backend && npm audit

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./backend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
EOL

# Create CD workflow
cat > "$WORKFLOW_DIR/cd.yml" << 'EOL'
name: CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Update ECS service
        run: |
          aws ecs update-service --cluster ${{ secrets.ECS_CLUSTER }} \
            --service ${{ secrets.ECS_SERVICE }} \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ secrets.ECS_CLUSTER }} \
            --services ${{ secrets.ECS_SERVICE }}

      - name: Verify deployment
        run: |
          curl -s http://${{ secrets.ALB_DNS }}/health | grep -q "ok"

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,ref,workflow,job,took
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: always()
EOL

# Create dependency update workflow
cat > "$WORKFLOW_DIR/dependencies.yml" << 'EOL'
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 0'  # Run weekly on Sunday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Update dependencies
        run: |
          npm update
          cd backend && npm update

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update dependencies'
          title: 'chore: update dependencies'
          body: |
            Automated dependency update

            This PR updates the project dependencies to their latest versions.

            Please review the changes and ensure they are compatible with the current codebase.

      - name: Run tests on PR
        if: ${{ github.event_name == 'pull_request' }}
        run: |
          npm test
          cd backend && npm test
EOL

# Create release workflow
cat > "$WORKFLOW_DIR/release.yml" << 'EOL'
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Build
        run: |
          npm run build
          cd backend && npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
          files: |
            dist/
            backend/dist/
            package.json
            backend/package.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOL

# Create secrets template
cat > ".github/secrets-template.md" << 'EOL'
# Required Secrets

This document lists all the secrets required for the CI/CD pipeline to function properly.

## Docker Hub
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token

## AWS
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `ECS_CLUSTER`: ECS cluster name
- `ECS_SERVICE`: ECS service name
- `ALB_DNS`: Application Load Balancer DNS name

## Security
- `SNYK_TOKEN`: Snyk API token for security scanning
- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications

## Application
- `JWT_SECRET`: Secret for JWT token generation
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string

## Monitoring
- `PROMETHEUS_USERNAME`: Prometheus basic auth username
- `PROMETHEUS_PASSWORD`: Prometheus basic auth password
- `GRAFANA_ADMIN_PASSWORD`: Grafana admin password
EOL

# Set up GitHub repository secrets
echo "Setting up GitHub repository secrets..."
gh secret set DOCKERHUB_USERNAME --body "$DOCKERHUB_USERNAME"
gh secret set DOCKERHUB_TOKEN --body "$DOCKERHUB_TOKEN"
gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY"
gh secret set AWS_REGION --body "$AWS_REGION"
gh secret set ECS_CLUSTER --body "$ECS_CLUSTER"
gh secret set ECS_SERVICE --body "$ECS_SERVICE"
gh secret set ALB_DNS --body "$ALB_DNS"
gh secret set SNYK_TOKEN --body "$SNYK_TOKEN"
gh secret set SLACK_WEBHOOK_URL --body "$SLACK_WEBHOOK_URL"
gh secret set JWT_SECRET --body "$JWT_SECRET"
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set REDIS_URL --body "$REDIS_URL"
gh secret set PROMETHEUS_USERNAME --body "$PROMETHEUS_USERNAME"
gh secret set PROMETHEUS_PASSWORD --body "$PROMETHEUS_PASSWORD"
gh secret set GRAFANA_ADMIN_PASSWORD --body "$GRAFANA_ADMIN_PASSWORD"

echo "CI/CD pipeline setup completed successfully!"
echo "Please review the generated workflows and secrets template."
echo "Make sure to update the secrets with your actual values."
