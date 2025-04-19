@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Configuration
echo ==============================

:: Function to check if a command exists
:check_command
where %1 >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] %1 is not installed or not in PATH
    exit /b 1
)
exit /b 0

:: Main menu
:menu
cls
echo Freelance Dashboard Configuration
echo ==============================
echo.
echo Environment Management:
echo 1. Create Development Environment
echo 2. Create Production Environment
echo 3. Create Testing Environment
echo 4. Switch Environment
echo.
echo Security:
echo 5. Generate JWT Secret
echo 6. Configure SSL/TLS
echo 7. Set Up Database Credentials
echo.
echo Monitoring:
echo 8. Configure Logging
echo 9. Set Up Error Tracking
echo 10. Configure Performance Monitoring
echo.
echo 11. Exit
echo.
set /p choice="Enter your choice (1-11): "

if "%choice%"=="1" goto create_dev
if "%choice%"=="2" goto create_prod
if "%choice%"=="3" goto create_test
if "%choice%"=="4" goto switch_env
if "%choice%"=="5" goto gen_jwt
if "%choice%"=="6" goto config_ssl
if "%choice%"=="7" goto config_db
if "%choice%"=="8" goto config_log
if "%choice%"=="9" goto config_error
if "%choice%"=="10" goto config_perf
if "%choice%"=="11" goto end
goto menu

:create_dev
cls
echo Creating Development Environment...
echo.
if exist .env.development (
    echo [WARNING] Development environment already exists
    echo Do you want to overwrite it? (Y/N)
    set /p overwrite=
    if /i not "%overwrite%"=="Y" goto menu
)

echo Creating .env.development...
(
echo NODE_ENV=development
echo PORT=3000
echo DATABASE_URL=postgresql://user:password@localhost:5432/freelance_dev
echo JWT_SECRET=dev_secret_change_in_production
echo LOG_LEVEL=debug
echo ENABLE_SWAGGER=true
echo API_RATE_LIMIT=100
echo SESSION_SECRET=dev_session_secret
echo CORS_ORIGIN=http://localhost:3000
) > .env.development

echo Development environment created successfully!
echo Press any key to continue...
pause > nul
goto menu

:create_prod
cls
echo Creating Production Environment...
echo.
if exist .env.production (
    echo [WARNING] Production environment already exists
    echo Do you want to overwrite it? (Y/N)
    set /p overwrite=
    if /i not "%overwrite%"=="Y" goto menu
)

echo Creating .env.production...
(
echo NODE_ENV=production
echo PORT=3000
echo DATABASE_URL=postgresql://user:password@localhost:5432/freelance_prod
echo JWT_SECRET=prod_secret_change_this
echo LOG_LEVEL=info
echo ENABLE_SWAGGER=false
echo API_RATE_LIMIT=50
echo SESSION_SECRET=prod_session_secret
echo CORS_ORIGIN=https://your-domain.com
) > .env.production

echo Production environment created successfully!
echo Press any key to continue...
pause > nul
goto menu

:create_test
cls
echo Creating Testing Environment...
echo.
if exist .env.test (
    echo [WARNING] Testing environment already exists
    echo Do you want to overwrite it? (Y/N)
    set /p overwrite=
    if /i not "%overwrite%"=="Y" goto menu
)

echo Creating .env.test...
(
echo NODE_ENV=test
echo PORT=3001
echo DATABASE_URL=postgresql://user:password@localhost:5432/freelance_test
echo JWT_SECRET=test_secret
echo LOG_LEVEL=error
echo ENABLE_SWAGGER=true
echo API_RATE_LIMIT=1000
echo SESSION_SECRET=test_session_secret
echo CORS_ORIGIN=http://localhost:3001
) > .env.test

echo Testing environment created successfully!
echo Press any key to continue...
pause > nul
goto menu

:switch_env
cls
echo Switching Environment...
echo.
echo Available environments:
echo 1. Development
echo 2. Production
echo 3. Testing
echo.
set /p env="Enter environment number (1-3): "

if "%env%"=="1" (
    if exist .env.development (
        copy /Y .env.development .env
        echo Switched to development environment
    ) else (
        echo [ERROR] Development environment not found
    )
) else if "%env%"=="2" (
    if exist .env.production (
        copy /Y .env.production .env
        echo Switched to production environment
    ) else (
        echo [ERROR] Production environment not found
    )
) else if "%env%"=="3" (
    if exist .env.test (
        copy /Y .env.test .env
        echo Switched to testing environment
    ) else (
        echo [ERROR] Testing environment not found
    )
) else (
    echo [ERROR] Invalid environment
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:gen_jwt
cls
echo Generating JWT Secret...
echo.
set "jwt_secret=%RANDOM%%RANDOM%%RANDOM%%RANDOM%"
echo Generated JWT Secret: %jwt_secret%
echo.
echo Do you want to update the current environment with this secret? (Y/N)
set /p update=
if /i "%update%"=="Y" (
    echo Updating JWT_SECRET in current environment...
    powershell -Command "(Get-Content .env) -replace 'JWT_SECRET=.*', 'JWT_SECRET=%jwt_secret%' | Set-Content .env"
    echo JWT secret updated successfully!
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_ssl
cls
echo Configuring SSL/TLS...
echo.
echo This will generate SSL certificates for development.
echo For production, please use proper SSL certificates.
echo.
echo Do you want to proceed? (Y/N)
set /p proceed=
if /i "%proceed%"=="Y" (
    echo Generating SSL certificates...
    mkdir certs 2>nul
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/private.key -out certs/certificate.crt
    if %errorlevel% equ 0 (
        echo SSL certificates generated successfully!
        echo Location: certs/
    ) else (
        echo [ERROR] Failed to generate SSL certificates
    )
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_db
cls
echo Configuring Database Credentials...
echo.
set /p db_user="Enter database username: "
set /p db_pass="Enter database password: "
set /p db_host="Enter database host (default: localhost): "
set /p db_port="Enter database port (default: 5432): "
set /p db_name="Enter database name: "

if "%db_host%"=="" set "db_host=localhost"
if "%db_port%"=="" set "db_port=5432"

set "db_url=postgresql://%db_user%:%db_pass%@%db_host%:%db_port%/%db_name%"

echo.
echo Generated Database URL: %db_url%
echo Do you want to update the current environment with this URL? (Y/N)
set /p update=
if /i "%update%"=="Y" (
    echo Updating DATABASE_URL in current environment...
    powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=%db_url%' | Set-Content .env"
    echo Database URL updated successfully!
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_log
cls
echo Configuring Logging...
echo.
echo Available log levels:
echo 1. error
echo 2. warn
echo 3. info
echo 4. debug
echo.
set /p level="Enter log level (1-4): "

if "%level%"=="1" set "log_level=error"
if "%level%"=="2" set "log_level=warn"
if "%level%"=="3" set "log_level=info"
if "%level%"=="4" set "log_level=debug"

echo.
echo Updating LOG_LEVEL in current environment...
powershell -Command "(Get-Content .env) -replace 'LOG_LEVEL=.*', 'LOG_LEVEL=%log_level%' | Set-Content .env"
echo Log level updated successfully!
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_error
cls
echo Configuring Error Tracking...
echo.
echo This will set up error tracking with Sentry.
echo You need a Sentry DSN to proceed.
echo.
set /p sentry_dsn="Enter Sentry DSN (or press Enter to skip): "

if not "%sentry_dsn%"=="" (
    echo.
    echo Updating Sentry configuration...
    powershell -Command "(Get-Content .env) -replace 'SENTRY_DSN=.*', 'SENTRY_DSN=%sentry_dsn%' | Set-Content .env"
    echo Sentry configuration updated successfully!
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_perf
cls
echo Configuring Performance Monitoring...
echo.
echo This will set up performance monitoring with New Relic.
echo You need a New Relic license key to proceed.
echo.
set /p newrelic_key="Enter New Relic license key (or press Enter to skip): "

if not "%newrelic_key%"=="" (
    echo.
    echo Updating New Relic configuration...
    powershell -Command "(Get-Content .env) -replace 'NEW_RELIC_LICENSE_KEY=.*', 'NEW_RELIC_LICENSE_KEY=%newrelic_key%' | Set-Content .env"
    echo New Relic configuration updated successfully!
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Configuration Tools!
echo.
pause
exit /b 0 