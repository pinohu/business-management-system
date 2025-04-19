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

# Function to securely prompt for input
function Get-SecureInput {
    param(
        [string]$Prompt,
        [switch]$MaskInput
    )

    if ($MaskInput) {
        $secureString = Read-Host -AsSecureString $Prompt
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    else {
        return Read-Host $Prompt
    }
}

# Function to validate AWS credentials
function Test-AWSCredentials {
    try {
        $result = aws sts get-caller-identity
        if ($result) {
            Write-Host "✓ AWS credentials are valid" -ForegroundColor $Green
            return $true
        }
    }
    catch {
        Write-Host "Error: AWS credentials are invalid" -ForegroundColor $Red
        return $false
    }
}

# Function to validate PostgreSQL connection
function Test-PostgreSQLConnection {
    param(
        [string]$Host,
        [string]$User,
        [string]$Password,
        [string]$Database
    )

    try {
        $env:PGPASSWORD = $Password
        $result = psql -h $Host -U $User -d $Database -c "SELECT 1;" 2>$null
        if ($result) {
            Write-Host "✓ PostgreSQL connection successful" -ForegroundColor $Green
            return $true
        }
    }
    catch {
        Write-Host "Error: PostgreSQL connection failed" -ForegroundColor $Red
        return $false
    }
}

# Main setup process
Write-Host "Starting credential setup process..." -ForegroundColor $Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor $Yellow
$requiredCommands = @("aws", "psql")
foreach ($cmd in $requiredCommands) {
    if (-not (Test-Command $cmd)) {
        Write-Host "Error: $cmd is not installed" -ForegroundColor $Red
        Write-Host "Please install $cmd and try again" -ForegroundColor $Yellow
        exit 1
    }
    Write-Host "✓ $cmd is installed" -ForegroundColor $Green
}

# AWS Credentials Setup
Write-Host "`nSetting up AWS credentials..." -ForegroundColor $Yellow
Write-Host "You'll need the following AWS information:" -ForegroundColor $Yellow
Write-Host "- AWS Access Key ID" -ForegroundColor $Yellow
Write-Host "- AWS Secret Access Key" -ForegroundColor $Yellow
Write-Host "- AWS Region (e.g., us-east-1)" -ForegroundColor $Yellow
Write-Host "- AWS Account ID" -ForegroundColor $Yellow

$awsAccessKey = Get-SecureInput "Enter AWS Access Key ID" -MaskInput
$awsSecretKey = Get-SecureInput "Enter AWS Secret Access Key" -MaskInput
$awsRegion = Get-SecureInput "Enter AWS Region (e.g., us-east-1)"
$awsAccountId = Get-SecureInput "Enter AWS Account ID"

# Configure AWS CLI
aws configure set aws_access_key_id $awsAccessKey
aws configure set aws_secret_access_key $awsSecretKey
aws configure set region $awsRegion

# Test AWS credentials
if (-not (Test-AWSCredentials)) {
    Write-Host "Error: AWS credentials are invalid" -ForegroundColor $Red
    exit 1
}

# PostgreSQL Credentials Setup
Write-Host "`nSetting up PostgreSQL credentials..." -ForegroundColor $Yellow
Write-Host "You'll need the following PostgreSQL information:" -ForegroundColor $Yellow
Write-Host "- Database Host" -ForegroundColor $Yellow
Write-Host "- Database User" -ForegroundColor $Yellow
Write-Host "- Database Password" -ForegroundColor $Yellow
Write-Host "- Database Name" -ForegroundColor $Yellow

$dbHost = Get-SecureInput "Enter Database Host (e.g., localhost)"
$dbUser = Get-SecureInput "Enter Database User"
$dbPassword = Get-SecureInput "Enter Database Password" -MaskInput
$dbName = Get-SecureInput "Enter Database Name"

# Test PostgreSQL connection
if (-not (Test-PostgreSQLConnection -Host $dbHost -User $dbUser -Password $dbPassword -Database $dbName)) {
    Write-Host "Error: PostgreSQL connection failed" -ForegroundColor $Red
    exit 1
}

# Create .env.production file
Write-Host "`nCreating .env.production file..." -ForegroundColor $Yellow
$envContent = @"
# AWS Configuration
AWS_ACCESS_KEY_ID=$awsAccessKey
AWS_SECRET_ACCESS_KEY=$awsSecretKey
AWS_REGION=$awsRegion
AWS_ACCOUNT_ID=$awsAccountId

# PostgreSQL Configuration
POSTGRES_HOST=$dbHost
POSTGRES_USER=$dbUser
POSTGRES_PASSWORD=$dbPassword
POSTGRES_DB=$dbName

# ECS Configuration
ECS_CLUSTER=app-cluster
ECS_SERVICE=app-service
ALB_TARGET_GROUP=app-target-group

# Domain Configuration
DOMAIN_NAME=app.example.com
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "`nCredential setup completed successfully!" -ForegroundColor $Green
Write-Host "The following files have been created/updated:" -ForegroundColor $Green
Write-Host "- AWS CLI configuration" -ForegroundColor $Green
Write-Host "- .env.production" -ForegroundColor $Green

Write-Host "`nNext steps:" -ForegroundColor $Yellow
Write-Host "1. Review the .env.production file and update any additional variables" -ForegroundColor $Yellow
Write-Host "2. Update the ECS_CLUSTER, ECS_SERVICE, ALB_TARGET_GROUP, and DOMAIN_NAME values" -ForegroundColor $Yellow
Write-Host "3. Run the deployment script: .\scripts\deploy.ps1" -ForegroundColor $Yellow
