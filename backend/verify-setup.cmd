@echo off
echo Verifying Setup Components
echo ========================

:: Check Node.js and npm
echo Checking Node.js and npm...
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Node.js: OK
    node --version
) else (
    echo Node.js: Not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo npm: OK
    npm --version
) else (
    echo npm: Not found
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

:: Check PostgreSQL
echo.
echo Checking PostgreSQL...
where postgres >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo PostgreSQL: OK
    postgres --version
) else (
    echo PostgreSQL: Not found
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

:: Check PostgreSQL service
echo.
echo Checking PostgreSQL service...
sc query postgresql >nul 2>nul
if %ERRORLEVEL% equ 0 (
    sc query postgresql | find "RUNNING" >nul
    if %ERRORLEVEL% equ 0 (
        echo PostgreSQL service: Running
    ) else (
        echo PostgreSQL service: Stopped
        echo Starting PostgreSQL service...
        net start postgresql
        if %ERRORLEVEL% neq 0 (
            echo Failed to start PostgreSQL service
            pause
            exit /b 1
        )
    )
) else (
    echo PostgreSQL service: Not found
    pause
    exit /b 1
)

:: Check database connection
echo.
echo Checking database connection...
psql -U postgres -c "SELECT 1;" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Database connection: OK
) else (
    echo Database connection: Failed
    echo Please check:
    echo 1. PostgreSQL service is running
    echo 2. Correct password is set
    echo 3. Database user exists
    pause
    exit /b 1
)

:: Check MailDev
echo.
echo Checking MailDev...
tasklist | find "maildev" >nul
if %ERRORLEVEL% equ 0 (
    echo MailDev: Running
) else (
    echo MailDev: Not running
    echo Starting MailDev...
    start /B maildev
    timeout /t 5 >nul
    tasklist | find "maildev" >nul
    if %ERRORLEVEL% equ 0 (
        echo MailDev started successfully
    ) else (
        echo Failed to start MailDev
        pause
        exit /b 1
    )
)

:: Check PM2
echo.
echo Checking PM2...
pm2 list >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo PM2: OK
    pm2 list
) else (
    echo PM2: Not running
    echo Starting PM2...
    pm2 start ecosystem.config.js
    if %ERRORLEVEL% equ 0 (
        echo PM2 started successfully
    ) else (
        echo Failed to start PM2
        pause
        exit /b 1
    )
)

:: Check application
echo.
echo Checking application...
if exist dist (
    echo Application build: OK
) else (
    echo Application build: Not found
    echo Building application...
    npm run build
    if %ERRORLEVEL% neq 0 (
        echo Failed to build application
        pause
        exit /b 1
    )
)

:: Check environment variables
echo.
echo Checking environment variables...
if exist .env (
    echo Environment file: OK
) else (
    echo Environment file: Not found
    echo Please run setup-open-source.cmd first
    pause
    exit /b 1
)

:: Check logs
echo.
echo Checking logs...
if exist logs (
    echo Logs directory: OK
    if exist logs\err.log (
        echo Error log: Present
    ) else (
        echo Error log: Not found
    )
    if exist logs\out.log (
        echo Output log: Present
    ) else (
        echo Output log: Not found
    )
) else (
    echo Logs directory: Not found
    mkdir logs
    echo Created logs directory
)

echo.
echo Setup Verification Complete!
echo.
echo All components are properly configured and running.
echo.
echo You can access:
echo - Application: http://localhost:3000
echo - Documentation: http://localhost:8080
echo - MailDev: http://localhost:1080
echo - PM2 Dashboard: http://localhost:9615
echo.
pause
