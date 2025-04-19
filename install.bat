@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Installation
echo ==============================

:: Function to check internet connection
:check_internet
ping 8.8.8.8 -n 1 >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: No internet connection detected!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
goto :eof

:: Function to check Node.js version
:check_node_version
for /f "tokens=*" %%a in ('node -v') do set "node_version=%%a"
set "node_version=!node_version:~1!"
if !node_version! lss 18.0.0 (
    echo Error: Node.js version must be 18.0.0 or higher!
    echo Current version: !node_version!
    echo Please install a newer version from https://nodejs.org/
    pause
    exit /b 1
)
goto :eof

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Choose the LTS (Long Term Support) version.
    pause
    exit /b 1
)

:: Check Node.js version
call :check_node_version

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed!
    echo Please install Node.js which includes npm.
    pause
    exit /b 1
)

:: Check internet connection
call :check_internet

:: Show current directory
echo Current directory: %CD%
echo.

:: Check if we're in the correct directory
if not exist package.json (
    echo Error: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Ask user if they want to proceed
echo This will install all required dependencies.
echo Do you want to continue? (Y/N)
set /p proceed=
if /i not "%proceed%"=="Y" (
    echo Installation cancelled.
    pause
    exit /b 0
)

:: Stop any running Node.js processes
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

:: Try to clean npm cache
echo.
echo Cleaning npm cache...
call npm cache clean --force
if %errorlevel% neq 0 (
    echo Warning: Could not clean npm cache
    echo Continuing anyway...
)

:: Remove existing node_modules and package-lock.json
if exist node_modules (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
    if %errorlevel% neq 0 (
        echo Warning: Could not remove node_modules
        echo Please close any programs that might be using these files
        echo and try again.
        pause
        exit /b 1
    )
)

if exist package-lock.json (
    echo Removing existing package-lock.json...
    del package-lock.json
    if %errorlevel% neq 0 (
        echo Warning: Could not remove package-lock.json
        echo Please close any programs that might be using this file
        echo and try again.
        pause
        exit /b 1
    )
)

:: Try different installation methods
echo.
echo Attempting to install dependencies...

:: Method 1: Try installing all at once
echo Method 1: Installing all dependencies at once...
call npm install --no-audit --no-fund
if %errorlevel% equ 0 (
    echo Successfully installed all dependencies!
) else (
    echo Method 1 failed, trying alternative method...
    
    :: Method 2: Install core dependencies first
    echo.
    echo Method 2: Installing core dependencies first...
    call npm install next@14.2.26 react@18.2.0 react-dom@18.2.0 --save --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo Error: Failed to install core dependencies
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    
    :: Method 2: Install UI dependencies
    echo Installing UI dependencies...
    call npm install @mui/material@5.15.10 @emotion/react@11.11.3 @emotion/styled@11.11.0 @mui/icons-material@5.15.10 --save --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo Error: Failed to install UI dependencies
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    
    :: Method 2: Install remaining dependencies
    echo Installing remaining dependencies...
    call npm install jsonwebtoken@9.0.2 cookie@0.6.0 recharts@2.12.0 --save --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo Error: Failed to install remaining dependencies
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    
    :: Method 2: Install dev dependencies
    echo Installing development dependencies...
    call npm install eslint@8.56.0 eslint-config-next@14.2.26 --save-dev --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo Warning: Failed to install development dependencies
        echo The application should still work, but some development features may be limited.
    )
)

:: Create .env.local if it doesn't exist
if not exist .env.local (
    echo.
    echo Creating .env.local file...
    echo JWT_SECRET=your-super-secret-key-change-this-in-production > .env.local
    echo NODE_ENV=development >> .env.local
)

:: Verify installation
echo.
echo Verifying installation...
call npm list --depth=0
if %errorlevel% neq 0 (
    echo Warning: Some packages might not be installed correctly
    echo Please check the error messages above.
)

echo.
echo Installation completed!
echo.
echo You can now run the following commands:
echo npm run dev    - Start the development server
echo npm run build  - Build for production
echo npm run start  - Start the production server
echo.
echo Troubleshooting:
echo If you encounter any issues:
echo 1. Make sure Node.js is installed correctly (version 18.0.0 or higher)
echo 2. Check your internet connection
echo 3. Try running the script as administrator
echo 4. Close any programs that might be using the project files
echo 5. Run cleanup.bat to start fresh
echo.
echo Press any key to exit...
pause > nul 