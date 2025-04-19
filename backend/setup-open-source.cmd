@echo off
setlocal enabledelayedexpansion

echo Setting up open-source alternatives...
echo ====================================

:: Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

:: Create necessary directories with error handling
echo Creating directories...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist docs mkdir docs

:: Check Node.js installation
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Please install Node.js from:
    echo https://nodejs.org/
    pause
    exit /b 1
)

:: Check npm installation
echo Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm not found. Please install Node.js which includes npm.
    pause
    exit /b 1
)

:: Install global dependencies with error handling
echo Installing global dependencies...
call npm install -g maildev
if %ERRORLEVEL% neq 0 (
    echo Failed to install maildev
    pause
    exit /b 1
)

call npm install -g pm2
if %ERRORLEVEL% neq 0 (
    echo Failed to install pm2
    pause
    exit /b 1
)

call npm install -g @compodoc/compodoc
if %ERRORLEVEL% neq 0 (
    echo Failed to install compodoc
    pause
    exit /b 1
)

:: Start MailDev in the background
echo Starting MailDev...
start /B maildev
timeout /t 5 >nul

:: Check if MailDev is running
tasklist | find "maildev" >nul
if %ERRORLEVEL% neq 0 (
    echo Failed to start MailDev
    pause
    exit /b 1
)

:: Install PostgreSQL if not already installed
echo Checking PostgreSQL installation...
where postgres >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL not found. Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    echo After installation, run this script again.
    pause
    exit /b 1
)

:: Create database and user with error handling
echo Setting up PostgreSQL database...
psql -U postgres -c "CREATE DATABASE business_management;" 2>nul
if %ERRORLEVEL% neq 0 (
    echo Failed to create database. Please check PostgreSQL installation and credentials.
    pause
    exit /b 1
)

psql -U postgres -c "CREATE USER business_user WITH PASSWORD 'business_password';" 2>nul
if %ERRORLEVEL% neq 0 (
    echo Failed to create database user.
    pause
    exit /b 1
)

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE business_management TO business_user;" 2>nul
if %ERRORLEVEL% neq 0 (
    echo Failed to grant database privileges.
    pause
    exit /b 1
)

:: Generate secure random strings for secrets
for /L %%i in (1,1,4) do set "RANDOM_STRING=!RANDOM_STRING!!RANDOM!"
set "JWT_SECRET=!RANDOM_STRING!"
set "RANDOM_STRING="
for /L %%i in (1,1,4) do set "RANDOM_STRING=!RANDOM_STRING!!RANDOM!"
set "CSRF_SECRET=!RANDOM_STRING!"

:: Update .env with new database credentials
echo Updating .env file...
(
echo # Application
echo NODE_ENV="development"
echo PORT=3000
echo API_PREFIX=/api/v1
echo.
echo # Database (PostgreSQL - Open Source)
echo DATABASE_URL="postgresql://business_user:business_password@localhost:5432/business_management?schema=public"
echo.
echo # JWT (jsonwebtoken - Open Source)
echo JWT_SECRET="!JWT_SECRET!"
echo JWT_EXPIRATION="1d"
echo JWT_REFRESH_EXPIRES_IN="7d"
echo.
echo # CORS
echo FRONTEND_URL="http://localhost:3001"
echo.
echo # Rate Limiting (express-rate-limit - Open Source)
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX=100
echo.
echo # Security
echo ENABLE_CSRF=true
echo CSRF_SECRET="!CSRF_SECRET!"
echo.
echo # Logging (Winston - Open Source)
echo LOG_LEVEL="info"
echo LOG_FILE="logs/app.log"
echo LOG_MAX_SIZE="20m"
echo LOG_MAX_FILES="14d"
echo.
echo # File Upload (multer - Open Source)
echo MAX_FILE_SIZE=10485760
echo UPLOAD_DIR="uploads"
echo.
echo # Email (Nodemailer + MailDev - Open Source)
echo SMTP_HOST="localhost"
echo SMTP_PORT=1025
echo SMTP_USER=""
echo SMTP_PASS=""
echo SMTP_FROM="noreply@localhost"
echo.
echo # Documentation (Compodoc - Open Source)
echo DOCS_PORT=8080
) > .env

:: Install project dependencies with error handling
echo Installing project dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install project dependencies
    pause
    exit /b 1
)

:: Run database migrations with error handling
echo Running database migrations...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo Failed to generate Prisma client
    pause
    exit /b 1
)

call npx prisma migrate dev
if %ERRORLEVEL% neq 0 (
    echo Failed to run database migrations
    pause
    exit /b 1
)

:: Generate documentation with error handling
echo Generating documentation...
call npm run docs:generate
if %ERRORLEVEL% neq 0 (
    echo Failed to generate documentation
    pause
    exit /b 1
)

:: Start PM2 process manager with error handling
echo Starting PM2 process manager...
call pm2 start ecosystem.config.js
if %ERRORLEVEL% neq 0 (
    echo Failed to start PM2 process manager
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo =============
echo.
echo Services running:
echo - PostgreSQL database: business_management
echo - MailDev (Email testing): http://localhost:1080
echo - Application: http://localhost:3000
echo - Documentation: http://localhost:8080
echo - PM2 Dashboard: http://localhost:9615
echo.
echo You can access:
echo - MailDev interface at http://localhost:1080
echo - Application documentation at http://localhost:8080
echo - PM2 dashboard at http://localhost:9615
echo.
echo Troubleshooting:
echo 1. If PostgreSQL connection fails, check if the service is running
echo 2. If MailDev fails, try running 'maildev' manually
echo 3. If PM2 fails, check the logs in the logs directory
echo 4. For database issues, check the Prisma logs
echo.
pause
