@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Monitoring
echo ============================

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

:: Main menu
:menu
cls
echo Freelance Dashboard Monitoring
echo ============================
echo.
echo System Monitoring:
echo 1. Check System Resources
echo 2. Monitor Network Usage
echo 3. Check Disk Space
echo.
echo Application Monitoring:
echo 4. Check Application Status
echo 5. Monitor API Endpoints
echo 6. Check Database Health
echo.
echo Performance Monitoring:
echo 7. Monitor Response Times
echo 8. Check Memory Usage
echo 9. Monitor CPU Usage
echo.
echo Logs:
echo 10. View Application Logs
echo 11. View Error Logs
echo 12. View Access Logs
echo.
echo 13. Exit
echo.
set /p choice="Enter your choice (1-13): "

if "%choice%"=="1" goto check_resources
if "%choice%"=="2" goto monitor_network
if "%choice%"=="3" goto check_disk
if "%choice%"=="4" goto check_app
if "%choice%"=="5" goto monitor_api
if "%choice%"=="6" goto check_db
if "%choice%"=="7" goto monitor_response
if "%choice%"=="8" goto check_memory
if "%choice%"=="9" goto monitor_cpu
if "%choice%"=="10" goto view_app_logs
if "%choice%"=="11" goto view_error_logs
if "%choice%"=="12" goto view_access_logs
if "%choice%"=="13" goto end
goto menu

:check_resources
cls
echo Checking System Resources...
echo.
echo CPU Usage:
wmic cpu get loadpercentage
echo.
echo Memory Usage:
wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value
echo.
echo Disk Usage:
wmic logicaldisk get size,freespace,caption
echo.
echo Press any key to continue...
pause > nul
goto menu

:monitor_network
cls
echo Monitoring Network Usage...
echo.
echo Active Connections:
netstat -n
echo.
echo Network Interface Statistics:
netstat -e
echo.
echo Press any key to continue...
pause > nul
goto menu

:check_disk
cls
echo Checking Disk Space...
echo.
echo Disk Space Usage:
wmic logicaldisk get size,freespace,caption,volumename
echo.
echo Press any key to continue...
pause > nul
goto menu

:check_app
cls
echo Checking Application Status...
echo.
echo Checking if Node.js process is running...
tasklist | find "node.exe"
echo.
echo Checking application port (3000)...
netstat -ano | find ":3000"
echo.
echo Press any key to continue...
pause > nul
goto menu

:monitor_api
cls
echo Monitoring API Endpoints...
echo.
echo Testing API endpoints...
echo.
echo Testing /api/health...
curl -s http://localhost:3000/api/health
echo.
echo Testing /api/auth...
curl -s http://localhost:3000/api/auth
echo.
echo Press any key to continue...
pause > nul
goto menu

:check_db
cls
echo Checking Database Health...
echo.
echo Testing database connection...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Database connection successful')).catch(e => console.error('Database connection failed:', e))"
echo.
echo Press any key to continue...
pause > nul
goto menu

:monitor_response
cls
echo Monitoring Response Times...
echo.
echo Testing response times for main endpoints...
echo.
echo Testing homepage...
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s http://localhost:3000
echo.
echo Testing API health endpoint...
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s http://localhost:3000/api/health
echo.
echo Press any key to continue...
pause > nul
goto menu

:check_memory
cls
echo Checking Memory Usage...
echo.
echo Node.js Process Memory Usage:
wmic process where "name='node.exe'" get WorkingSetSize,ProcessId
echo.
echo System Memory Usage:
wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value
echo.
echo Press any key to continue...
pause > nul
goto menu

:monitor_cpu
cls
echo Monitoring CPU Usage...
echo.
echo Current CPU Usage:
wmic cpu get loadpercentage
echo.
echo Process CPU Usage:
wmic process where "name='node.exe'" get PercentProcessorTime,ProcessId
echo.
echo Press any key to continue...
pause > nul
goto menu

:view_app_logs
cls
echo Viewing Application Logs...
echo.
if exist logs/app.log (
    type logs/app.log | more
) else (
    echo No application logs found.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:view_error_logs
cls
echo Viewing Error Logs...
echo.
if exist logs/error.log (
    type logs/error.log | more
) else (
    echo No error logs found.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:view_access_logs
cls
echo Viewing Access Logs...
echo.
if exist logs/access.log (
    type logs/access.log | more
) else (
    echo No access logs found.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Monitoring Tools!
echo.
pause
exit /b 0 