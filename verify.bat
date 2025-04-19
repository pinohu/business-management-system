@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Verification
echo ==============================

:: Function to check if a command exists
:check_command
where %1 >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] %1 is not installed or not in PATH
    exit /b 1
)
exit /b 0

:: Function to check if a port is in use
:check_port
netstat -ano | find ":%1" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Port %1 is in use
    echo Please free up port %1 or use a different port
    exit /b 1
)
exit /b 0

:: Function to verify npm package
:verify_package
echo Checking %1...
call npm list %1 --depth=0 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] %1 is not installed correctly
    exit /b 1
)
echo %1: OK
exit /b 0

:: Main verification process
echo Starting verification process...
echo.

:: Check required commands
echo Checking required commands...
call :check_command node
call :check_command npm
if %errorlevel% neq 0 (
    echo [ERROR] Required commands are missing
    echo Please install Node.js and npm
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%a in ('node -v') do set "node_version=%%a"
set "node_version=!node_version:~1!"
echo Node.js version: !node_version!
if !node_version! lss 18.0.0 (
    echo [ERROR] Node.js version must be 18.0.0 or higher
    pause
    exit /b 1
)

:: Check npm version
for /f "tokens=*" %%a in ('npm -v') do set "npm_version=%%a"
echo npm version: !npm_version!
if !npm_version! lss 9.0.0 (
    echo [WARNING] npm version is below 9.0.0
    echo Consider updating npm using: npm install -g npm@latest
)

:: Check if we're in the correct directory
if not exist package.json (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Check required files
echo.
echo Checking required files...
if not exist .env.local (
    echo [ERROR] .env.local file not found
    echo Please create it with the following content:
    echo JWT_SECRET=your-super-secret-key-change-this-in-production
    echo NODE_ENV=development
    pause
    exit /b 1
)

:: Check required directories
if not exist node_modules (
    echo [ERROR] node_modules directory not found
    echo Please run install.bat first
    pause
    exit /b 1
)

:: Verify required packages
echo.
echo Verifying required packages...
call :verify_package next
call :verify_package react
call :verify_package react-dom
call :verify_package @mui/material
call :verify_package @emotion/react
call :verify_package @emotion/styled
call :verify_package @mui/icons-material
call :verify_package jsonwebtoken
call :verify_package cookie
call :verify_package recharts

:: Check ports
echo.
echo Checking required ports...
call :check_port 3000
call :check_port 3001

:: Check environment variables
echo.
echo Checking environment variables...
if "%NODE_ENV%"=="" (
    echo [WARNING] NODE_ENV is not set
    echo Setting it to development...
    set NODE_ENV=development
)

:: Try to build the project
echo.
echo Attempting to build the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    echo Please check the error messages above
    pause
    exit /b 1
)

:: Verify the build
if not exist .next (
    echo [ERROR] Build directory not found
    echo The build process may have failed
    pause
    exit /b 1
)

echo.
echo Verification completed successfully!
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start the development server
echo 2. Access the application at http://localhost:3000
echo 3. If you encounter any issues, run troubleshoot.bat
echo.
echo Press any key to exit...
pause > nul 