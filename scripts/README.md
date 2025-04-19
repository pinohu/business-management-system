# Deployment Scripts

This directory contains scripts for deploying the application to AWS ECS. There are three ways to run the deployment:

## Prerequisites

Before running any of the deployment scripts, ensure you have:

1. Docker Desktop installed and running
2. AWS CLI installed and configured with appropriate credentials
3. Required environment variables set in `.env.production`:
   - `POSTGRES_PASSWORD`
   - `POSTGRES_USER`
   - `POSTGRES_DB`
   - `ECS_CLUSTER`
   - `ECS_SERVICE`
   - `ALB_TARGET_GROUP`
   - `DOMAIN_NAME`
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`

## Running the Deployment

### Option 1: Using PowerShell (Recommended for Windows)

1. Open PowerShell as Administrator
2. Navigate to the project root directory
3. Run:
   ```powershell
   .\scripts\deploy.ps1
   ```

### Option 2: Using Git Bash

1. Open Git Bash
2. Navigate to the project root directory
3. Run:
   ```bash
   ./scripts/deploy.sh
   ```

### Option 3: Using Batch Script

1. Open Command Prompt
2. Navigate to the project root directory
3. Run:
   ```cmd
   .\scripts\run-deploy.bat
   ```

## What the Scripts Do

The deployment process includes:

1. Checking prerequisites and environment variables
2. Creating a backup of the current state
3. Building Docker images for frontend and backend
4. Pushing images to Amazon ECR
5. Updating the ECS service
6. Verifying the deployment health
7. Rolling back if verification fails

## Safety Features

- Automatic backup creation before deployment
- Rollback capability if deployment fails
- Health check verification with retries
- Administrator privileges check
- Docker Desktop status verification
- AWS CLI configuration verification

## Troubleshooting

If you encounter issues:

1. Ensure Docker Desktop is running
2. Verify AWS CLI is configured correctly
3. Check all required environment variables are set
4. Run PowerShell as Administrator
5. Check the backup directory for any failed deployments

## Rollback

If a deployment fails, the script will automatically:
1. Stop the current deployment
2. Restore from the latest backup
3. Restart the service

## Support

For additional support or questions, please refer to the main project documentation or contact the development team.
