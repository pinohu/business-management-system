@echo off
echo Troubleshooting Open Source Services
echo ==================================

:: Check Node.js and npm
echo Checking Node.js and npm...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm not found. Please install Node.js which includes npm.
    pause
    exit /b 1
)

:: Check PostgreSQL
echo Checking PostgreSQL...
where postgres >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

:: Check if PostgreSQL service is running
sc query postgresql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL service not found. Please install PostgreSQL.
    pause
    exit /b 1
)

sc query postgresql | find "RUNNING" >nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL service is not running. Starting service...
    net start postgresql
    if %ERRORLEVEL% neq 0 (
        echo Failed to start PostgreSQL service. Please start it manually.
        pause
        exit /b 1
    )
)

:: Check MailDev
echo Checking MailDev...
tasklist | find "maildev" >nul
if %ERRORLEVEL% neq 0 (
    echo MailDev not running. Starting MailDev...
    start /B maildev
    timeout /t 5 >nul
    tasklist | find "maildev" >nul
    if %ERRORLEVEL% neq 0 (
        echo Failed to start MailDev. Please check the installation.
        pause
        exit /b 1
    )
)

:: Check PM2
echo Checking PM2...
pm2 list >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PM2 not running. Starting PM2...
    pm2 start ecosystem.config.js
    if %ERRORLEVEL% neq 0 (
        echo Failed to start PM2. Please check the installation.
        pause
        exit /b 1
    )
)

:: Check database connection
echo Checking database connection...
psql -U postgres -c "SELECT 1" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Failed to connect to PostgreSQL. Please check:
    echo 1. PostgreSQL service is running
    echo 2. Correct password is set
    echo 3. Database user exists
    pause
    exit /b 1
)

:: Check Prisma
echo Checking Prisma...
npx prisma generate >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Failed to generate Prisma client. Please check:
    echo 1. Prisma is installed
    echo 2. Database connection is correct
    pause
    exit /b 1
)

:: Check application
echo Checking application...
if not exist dist (
    echo Building application...
    npm run build
    if %ERRORLEVEL% neq 0 (
        echo Failed to build application. Please check the logs.
        pause
        exit /b 1
    )
)

:: Check logs
echo Checking logs...
if exist logs\err.log (
    echo Error log contents:
    type logs\err.log
    echo.
)

if exist logs\out.log (
    echo Output log contents:
    type logs\out.log
    echo.
)

echo.
echo All checks completed!
echo.
echo Services status:
echo - PostgreSQL: Running
echo - MailDev: Running
echo - PM2: Running
echo - Application: Built
echo.
echo You can access:
echo - MailDev interface at http://localhost:1080
echo - Application at http://localhost:3000
echo - PM2 dashboard at http://localhost:9615
echo.
pause
