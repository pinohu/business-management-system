@echo off
setlocal enabledelayedexpansion

:: Set error handling
set "ErrorActionPreference=Stop"

:: Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PowerShell is not installed
    exit /b 1
)

:: Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"

:: Check if the script executed successfully
if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed
    exit /b 1
)

echo Deployment completed successfully
exit /b 0
