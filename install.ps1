# PowerShell Setup Script
Write-Host "Freelance Dashboard Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Get the script's directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to the project directory
Write-Host "Navigating to project directory..." -ForegroundColor Yellow
Set-Location $scriptPath

# Verify we're in the correct directory
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Clean npm cache
Write-Host "`nCleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Remove existing node_modules and package-lock.json if they exist
if (Test-Path "node_modules") {
    Write-Host "Removing existing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing existing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json"
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow

# Core dependencies
Write-Host "Installing core dependencies..." -ForegroundColor Cyan
npm install next@14.2.26 react@18.2.0 react-dom@18.2.0 --save

# Material-UI dependencies
Write-Host "Installing Material-UI dependencies..." -ForegroundColor Cyan
npm install @mui/material@5.15.10 @emotion/react@11.11.3 @emotion/styled@11.11.0 @mui/icons-material@5.15.10 --save

# Authentication dependencies
Write-Host "Installing authentication dependencies..." -ForegroundColor Cyan
npm install jsonwebtoken@9.0.2 cookie@0.6.0 --save

# Chart dependencies
Write-Host "Installing chart dependencies..." -ForegroundColor Cyan
npm install recharts@2.12.0 --save

# Development dependencies
Write-Host "Installing development dependencies..." -ForegroundColor Cyan
npm install eslint@8.56.0 eslint-config-next@14.2.26 --save-dev

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "`nCreating .env.local file..." -ForegroundColor Yellow
    @"
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "`nYou can now run the following commands:" -ForegroundColor Yellow
Write-Host "npm run dev    - Start the development server" -ForegroundColor Cyan
Write-Host "npm run build  - Build for production" -ForegroundColor Cyan
Write-Host "npm run start  - Start the production server" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 