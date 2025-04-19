# Exit on error
$ErrorActionPreference = "Stop"

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow

# Function to check if a command exists
function Test-Command {
    param($Command)
    return [bool](Get-Command -Name $Command -ErrorAction SilentlyContinue)
}

# Function to check if a variable is set
function Test-Variable {
    param($VariableName)
    $value = Get-Variable -Name $VariableName -ErrorAction SilentlyContinue
    if (-not $value) {
        Write-Host "Error: $VariableName is not set" -ForegroundColor $Red
        return $false
    }
    Write-Host "✓ $VariableName is set" -ForegroundColor $Green
    return $true
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to check if Docker Desktop is running
function Test-DockerDesktop {
    $dockerService = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
    if (-not $dockerService -or $dockerService.Status -ne "Running") {
        Write-Host "Error: Docker Desktop is not running" -ForegroundColor $Red
        return $false
    }
    Write-Host "✓ Docker Desktop is running" -ForegroundColor $Green
    return $true
}

# Function to check if AWS CLI is configured
function Test-AWSConfig {
    try {
        $awsConfig = aws configure list
        if (-not $awsConfig) {
            Write-Host "Error: AWS CLI is not configured" -ForegroundColor $Red
            return $false
        }
        Write-Host "✓ AWS CLI is configured" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "Error: AWS CLI is not configured" -ForegroundColor $Red
        return $false
    }
}

# Function to create a backup
function New-Backup {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups\$timestamp"

    Write-Host "Creating backup..." -ForegroundColor $Green

    # Create backup directory
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

    # Backup database
    Write-Host "Backing up database..." -ForegroundColor $Yellow
    $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    pg_dump -h localhost -U $env:POSTGRES_USER -d $env:POSTGRES_DB > "$backupDir\database.sql"

    # Backup environment files
    Write-Host "Backing up environment files..." -ForegroundColor $Yellow
    Copy-Item .env.production "$backupDir\"
    Copy-Item .env.development "$backupDir\"

    # Backup Docker volumes
    Write-Host "Backing up Docker volumes..." -ForegroundColor $Yellow
    docker run --rm -v app_data:/data -v "${backupDir}:/backup" alpine tar czf /backup/volumes.tar.gz -C /data .

    Write-Host "Backup created successfully in $backupDir" -ForegroundColor $Green
}

# Function to build Docker images
function Build-DockerImages {
    Write-Host "Building Docker images..." -ForegroundColor $Green

    # Build frontend
    Write-Host "Building frontend image..." -ForegroundColor $Yellow
    docker build -t app-frontend:latest -f frontend/Dockerfile frontend/

    # Build backend
    Write-Host "Building backend image..." -ForegroundColor $Yellow
    docker build -t app-backend:latest -f backend/Dockerfile backend/

    Write-Host "Docker images built successfully" -ForegroundColor $Green
}

# Function to push images to ECR
function Push-ToECR {
    Write-Host "Pushing images to ECR..." -ForegroundColor $Green

    # Get ECR login token
    $ecrPassword = aws ecr get-login-password --region $env:AWS_REGION
    $ecrPassword | docker login --username AWS --password-stdin "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com"

    # Tag and push frontend
    docker tag app-frontend:latest "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com/app-frontend:latest"
    docker push "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com/app-frontend:latest"

    # Tag and push backend
    docker tag app-backend:latest "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com/app-backend:latest"
    docker push "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com/app-backend:latest"

    Write-Host "Images pushed to ECR successfully" -ForegroundColor $Green
}

# Function to update ECS service
function Update-ECSService {
    Write-Host "Updating ECS service..." -ForegroundColor $Green

    # Force new deployment
    aws ecs update-service --cluster $env:ECS_CLUSTER --service $env:ECS_SERVICE --force-new-deployment

    # Wait for deployment to complete
    Write-Host "Waiting for deployment to complete..." -ForegroundColor $Yellow
    aws ecs wait services-stable --cluster $env:ECS_CLUSTER --services $env:ECS_SERVICE

    Write-Host "ECS service updated successfully" -ForegroundColor $Green
}

# Function to verify deployment
function Test-Deployment {
    Write-Host "Verifying deployment..." -ForegroundColor $Green

    # Check service health
    $healthUrl = "https://$env:DOMAIN_NAME/health"
    Write-Host "Checking service health at $healthUrl..." -ForegroundColor $Yellow

    $maxAttempts = 30
    $attempt = 1

    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing
            if ($response.Content -match "ok") {
                Write-Host "Service is healthy" -ForegroundColor $Green
                return $true
            }
        }
        catch {
            Write-Host "Attempt $attempt/$maxAttempts: Service not healthy yet" -ForegroundColor $Yellow
            Start-Sleep -Seconds 10
            $attempt++
        }
    }

    Write-Host "Service failed to become healthy" -ForegroundColor $Red
    return $false
}

# Function to rollback deployment
function Invoke-Rollback {
    Write-Host "Rolling back deployment..." -ForegroundColor $Red

    # Stop current deployment
    aws ecs update-service --cluster $env:ECS_CLUSTER --service $env:ECS_SERVICE --desired-count 0

    # Wait for tasks to drain
    aws ecs wait services-stable --cluster $env:ECS_CLUSTER --services $env:ECS_SERVICE

    # Restore from backup
    $latestBackup = Get-ChildItem -Path "backups" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latestBackup) {
        Write-Host "No backup found for rollback" -ForegroundColor $Red
        return $false
    }

    # Restore database
    Write-Host "Restoring database..." -ForegroundColor $Yellow
    $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    Get-Content "$($latestBackup.FullName)\database.sql" | psql -h localhost -U $env:POSTGRES_USER -d $env:POSTGRES_DB

    # Restore environment files
    Write-Host "Restoring environment files..." -ForegroundColor $Yellow
    Copy-Item "$($latestBackup.FullName)\.env.production" .env.production
    Copy-Item "$($latestBackup.FullName)\.env.development" .env.development

    # Restore Docker volumes
    Write-Host "Restoring Docker volumes..." -ForegroundColor $Yellow
    docker run --rm -v app_data:/data -v "$($latestBackup.FullName)":/backup alpine sh -c "cd /data && tar xzf /backup/volumes.tar.gz"

    # Restart service
    aws ecs update-service --cluster $env:ECS_CLUSTER --service $env:ECS_SERVICE --desired-count 1

    Write-Host "Rollback completed" -ForegroundColor $Green
    return $true
}

# Main deployment process
Write-Host "Starting deployment process..." -ForegroundColor $Green

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-Host "Error: This script requires administrator privileges" -ForegroundColor $Red
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor $Yellow
    exit 1
}

# Check Docker Desktop
if (-not (Test-DockerDesktop)) {
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor $Yellow
    exit 1
}

# Check AWS configuration
if (-not (Test-AWSConfig)) {
    Write-Host "Please configure AWS CLI and try again" -ForegroundColor $Yellow
    Write-Host "Run 'aws configure' to set up your AWS credentials" -ForegroundColor $Yellow
    exit 1
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor $Yellow
$requiredCommands = @("docker", "aws", "curl", "psql")
foreach ($cmd in $requiredCommands) {
    if (-not (Test-Command $cmd)) {
        Write-Host "Error: $cmd is not installed" -ForegroundColor $Red
        exit 1
    }
    Write-Host "✓ $cmd is installed" -ForegroundColor $Green
}

# Check required environment variables
Write-Host "Checking environment variables..." -ForegroundColor $Yellow
$requiredVars = @(
    "POSTGRES_PASSWORD",
    "POSTGRES_USER",
    "POSTGRES_DB",
    "ECS_CLUSTER",
    "ECS_SERVICE",
    "ALB_TARGET_GROUP",
    "DOMAIN_NAME",
    "AWS_REGION",
    "AWS_ACCOUNT_ID"
)

foreach ($var in $requiredVars) {
    if (-not (Test-Variable $var)) {
        exit 1
    }
}

# Create backup
New-Backup

# Build and push Docker images
Build-DockerImages
Push-ToECR

# Update ECS service
Update-ECSService

# Verify deployment
if (-not (Test-Deployment)) {
    Write-Host "Deployment verification failed" -ForegroundColor $Red
    Invoke-Rollback
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor $Green
Write-Host "Your application is now live at https://$env:DOMAIN_NAME" -ForegroundColor $Green
