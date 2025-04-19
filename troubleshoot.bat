@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Troubleshooting
echo =================================

:: Function to check Node.js version
:check_node_version
for /f "tokens=*" %%a in ('node -v') do set "node_version=%%a"
set "node_version=!node_version:~1!"
echo Current Node.js version: !node_version!
if !node_version! lss 18.0.0 (
    echo [ERROR] Node.js version must be 18.0.0 or higher!
    echo Please install a newer version from https://nodejs.org/
    echo Choose the LTS (Long Term Support) version.
    pause
    exit /b 1
)
goto :eof

:: Function to check npm version
:check_npm_version
for /f "tokens=*" %%a in ('npm -v') do set "npm_version=%%a"
echo Current npm version: !npm_version!
if !npm_version! lss 9.0.0 (
    echo [WARNING] npm version is below 9.0.0
    echo Consider updating npm using: npm install -g npm@latest
)
goto :eof

:: Function to check disk space
:check_disk_space
for /f "tokens=3" %%a in ('dir /-c 2^|find "bytes free"') do set "free_space=%%a"
set /a "free_space_mb=!free_space! / 1048576"
echo Available disk space: !free_space_mb! MB
if !free_space_mb! lss 1000 (
    echo [WARNING] Less than 1GB of free disk space
    echo Please free up some disk space before continuing
    pause
    exit /b 1
)
goto :eof

:: Function to check internet connection
:check_internet
echo Checking internet connection...
ping 8.8.8.8 -n 1 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No internet connection detected!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
echo Internet connection: OK
goto :eof

:: Function to check npm configuration
:check_npm_config
echo Checking npm configuration...
call npm config list
if %errorlevel% neq 0 (
    echo [WARNING] Could not read npm configuration
    echo Try running: npm config set registry https://registry.npmjs.org/
)
goto :eof

:: Function to check for running processes
:check_processes
echo Checking for running Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [WARNING] Found running Node.js processes
    echo Stopping Node.js processes...
    taskkill /F /IM node.exe /T >nul 2>&1
    timeout /t 2 >nul
)
goto :eof

:: Function to check file permissions
:check_permissions
echo Checking file permissions...
icacls . >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Insufficient permissions in current directory
    echo Please run this script as administrator
    pause
    exit /b 1
)
goto :eof

:: Main troubleshooting process
echo Starting troubleshooting process...
echo.

:: Check if we're in the correct directory
if not exist package.json (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Run all checks
call :check_node_version
call :check_npm_version
call :check_disk_space
call :check_internet
call :check_npm_config
call :check_processes
call :check_permissions

echo.
echo Checking for common issues...
echo.

:: Check for antivirus interference
echo Checking for antivirus interference...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [WARNING] Node.js processes are running
    echo This might indicate antivirus interference
    echo Try temporarily disabling your antivirus
)

:: Check for proxy settings
echo Checking proxy settings...
call npm config get proxy
if %errorlevel% equ 0 (
    echo [INFO] Proxy settings detected
    echo If you're not using a proxy, try:
    echo npm config delete proxy
    echo npm config delete https-proxy
)

:: Check for firewall settings
echo Checking firewall settings...
netsh advfirewall show allprofiles | findstr "State" >nul
if %errorlevel% equ 0 (
    echo [INFO] Windows Firewall is active
    echo Make sure Node.js is allowed through the firewall
)

:: Check for system environment variables
echo Checking system environment variables...
echo PATH: %PATH%
echo NODE_PATH: %NODE_PATH%
echo.

:: Ask user if they want to try fixes
echo Would you like to try automatic fixes? (Y/N)
set /p try_fixes=
if /i "%try_fixes%"=="Y" (
    echo.
    echo Attempting fixes...
    
    :: Reset npm configuration
    echo Resetting npm configuration...
    call npm config set registry https://registry.npmjs.org/
    
    :: Clear npm cache
    echo Clearing npm cache...
    call npm cache clean --force
    
    :: Remove problematic files
    if exist node_modules (
        echo Removing node_modules...
        rmdir /s /q node_modules
    )
    
    if exist package-lock.json (
        echo Removing package-lock.json...
        del package-lock.json
    )
    
    if exist .next (
        echo Removing .next directory...
        rmdir /s /q .next
    )
    
    echo.
    echo Automatic fixes completed.
    echo Please run install.bat to reinstall dependencies.
)

echo.
echo Troubleshooting Summary:
echo 1. Node.js version: !node_version!
echo 2. npm version: !npm_version!
echo 3. Internet connection: OK
echo 4. Disk space: !free_space_mb! MB available
echo 5. File permissions: OK
echo.
echo Next steps:
echo 1. Run cleanup.bat to remove all installed packages
echo 2. Run install.bat to reinstall dependencies
echo 3. If issues persist, check the error messages above
echo.
echo Press any key to exit...
pause > nul 