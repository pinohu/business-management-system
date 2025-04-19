@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Metrics & Alerts
echo =================================

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
echo Freelance Dashboard Metrics & Alerts
echo =================================
echo.
echo Metrics Collection:
echo 1. Collect System Metrics
echo 2. Collect Application Metrics
echo 3. Collect Database Metrics
echo 4. Collect Network Metrics
echo.
echo Alert Configuration:
echo 5. Configure CPU Alerts
echo 6. Configure Memory Alerts
echo 7. Configure Disk Alerts
echo 8. Configure Response Time Alerts
echo.
echo Monitoring:
echo 9. View Active Alerts
echo 10. View Historical Metrics
echo 11. Generate Metrics Report
echo.
echo 12. Exit
echo.
set /p choice="Enter your choice (1-12): "

if "%choice%"=="1" goto collect_system
if "%choice%"=="2" goto collect_app
if "%choice%"=="3" goto collect_db
if "%choice%"=="4" goto collect_network
if "%choice%"=="5" goto config_cpu
if "%choice%"=="6" goto config_memory
if "%choice%"=="7" goto config_disk
if "%choice%"=="8" goto config_response
if "%choice%"=="9" goto view_alerts
if "%choice%"=="10" goto view_history
if "%choice%"=="11" goto generate_report
if "%choice%"=="12" goto end
goto menu

:collect_system
cls
echo Collecting System Metrics...
echo.
set "metrics_dir=metrics"
if not exist %metrics_dir% mkdir %metrics_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "metrics_file=%metrics_dir%\system_%timestamp%.json"

echo Collecting CPU metrics...
for /f "tokens=*" %%a in ('wmic cpu get loadpercentage /value ^| find "="') do (
    set "%%a"
    echo {"timestamp": "%timestamp%", "metric": "cpu_usage", "value": "%loadpercentage%"} >> %metrics_file%
)

echo Collecting memory metrics...
for /f "tokens=*" %%a in ('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /value ^| find "="') do (
    set "%%a"
    echo {"timestamp": "%timestamp%", "metric": "memory_free", "value": "%FreePhysicalMemory%"} >> %metrics_file%
    echo {"timestamp": "%timestamp%", "metric": "memory_total", "value": "%TotalVisibleMemorySize%"} >> %metrics_file%
)

echo Collecting disk metrics...
for /f "tokens=*" %%a in ('wmic logicaldisk get size,freespace,caption /value ^| find "="') do (
    set "%%a"
    echo {"timestamp": "%timestamp%", "metric": "disk_size", "value": "%size%", "drive": "%caption%"} >> %metrics_file%
    echo {"timestamp": "%timestamp%", "metric": "disk_free", "value": "%freespace%", "drive": "%caption%"} >> %metrics_file%
)

echo System metrics collected successfully!
echo Metrics saved to: %metrics_file%
echo Press any key to continue...
pause > nul
goto menu

:collect_app
cls
echo Collecting Application Metrics...
echo.
set "metrics_dir=metrics"
if not exist %metrics_dir% mkdir %metrics_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "metrics_file=%metrics_dir%\app_%timestamp%.json"

echo Collecting Node.js process metrics...
for /f "tokens=*" %%a in ('wmic process where "name='node.exe'" get WorkingSetSize,PercentProcessorTime,ProcessId /value ^| find "="') do (
    set "%%a"
    echo {"timestamp": "%timestamp%", "metric": "node_memory", "value": "%WorkingSetSize%", "pid": "%ProcessId%"} >> %metrics_file%
    echo {"timestamp": "%timestamp%", "metric": "node_cpu", "value": "%PercentProcessorTime%", "pid": "%ProcessId%"} >> %metrics_file%
)

echo Testing API endpoints...
curl -s -w "\n%{time_total}\n" http://localhost:3000/api/health > temp.txt
set /p response_time=<temp.txt
echo {"timestamp": "%timestamp%", "metric": "api_health_response", "value": "%response_time%"} >> %metrics_file%

echo Application metrics collected successfully!
echo Metrics saved to: %metrics_file%
echo Press any key to continue...
pause > nul
goto menu

:collect_db
cls
echo Collecting Database Metrics...
echo.
set "metrics_dir=metrics"
if not exist %metrics_dir% mkdir %metrics_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "metrics_file=%metrics_dir%\db_%timestamp%.json"

echo Testing database connection and collecting metrics...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT COUNT(*) as count FROM users').then(result => console.log(JSON.stringify({timestamp: '%timestamp%', metric: 'user_count', value: result[0].count}))).catch(e => console.error(e))" >> %metrics_file%

echo Database metrics collected successfully!
echo Metrics saved to: %metrics_file%
echo Press any key to continue...
pause > nul
goto menu

:collect_network
cls
echo Collecting Network Metrics...
echo.
set "metrics_dir=metrics"
if not exist %metrics_dir% mkdir %metrics_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "metrics_file=%metrics_dir%\network_%timestamp%.json"

echo Collecting network interface statistics...
for /f "tokens=*" %%a in ('netstat -e ^| findstr /v "Interface"') do (
    set "line=%%a"
    set "bytes_received=!line:~0,20!"
    set "bytes_sent=!line:~20,20!"
    echo {"timestamp": "%timestamp%", "metric": "bytes_received", "value": "%bytes_received%"} >> %metrics_file%
    echo {"timestamp": "%timestamp%", "metric": "bytes_sent", "value": "%bytes_sent%"} >> %metrics_file%
)

echo Network metrics collected successfully!
echo Metrics saved to: %metrics_file%
echo Press any key to continue...
pause > nul
goto menu

:config_cpu
cls
echo Configuring CPU Alerts...
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% mkdir %alerts_dir%

echo Current CPU alert settings:
if exist %alerts_dir%\cpu_alerts.json (
    type %alerts_dir%\cpu_alerts.json
) else (
    echo No CPU alerts configured
)

echo.
set /p threshold="Enter CPU usage threshold (1-100): "
set /p duration="Enter alert duration in minutes: "
set /p action="Enter alert action (email/notification/log): "

echo {"threshold": %threshold%, "duration": %duration%, "action": "%action%"} > %alerts_dir%\cpu_alerts.json

echo CPU alerts configured successfully!
echo Press any key to continue...
pause > nul
goto menu

:config_memory
cls
echo Configuring Memory Alerts...
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% mkdir %alerts_dir%

echo Current memory alert settings:
if exist %alerts_dir%\memory_alerts.json (
    type %alerts_dir%\memory_alerts.json
) else (
    echo No memory alerts configured
)

echo.
set /p threshold="Enter memory usage threshold (1-100): "
set /p duration="Enter alert duration in minutes: "
set /p action="Enter alert action (email/notification/log): "

echo {"threshold": %threshold%, "duration": %duration%, "action": "%action%"} > %alerts_dir%\memory_alerts.json

echo Memory alerts configured successfully!
echo Press any key to continue...
pause > nul
goto menu

:config_disk
cls
echo Configuring Disk Alerts...
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% mkdir %alerts_dir%

echo Current disk alert settings:
if exist %alerts_dir%\disk_alerts.json (
    type %alerts_dir%\disk_alerts.json
) else (
    echo No disk alerts configured
)

echo.
set /p threshold="Enter disk usage threshold (1-100): "
set /p drive="Enter drive letter to monitor: "
set /p action="Enter alert action (email/notification/log): "

echo {"threshold": %threshold%, "drive": "%drive%", "action": "%action%"} > %alerts_dir%\disk_alerts.json

echo Disk alerts configured successfully!
echo Press any key to continue...
pause > nul
goto menu

:config_response
cls
echo Configuring Response Time Alerts...
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% mkdir %alerts_dir%

echo Current response time alert settings:
if exist %alerts_dir%\response_alerts.json (
    type %alerts_dir%\response_alerts.json
) else (
    echo No response time alerts configured
)

echo.
set /p threshold="Enter response time threshold in seconds: "
set /p endpoint="Enter endpoint to monitor: "
set /p action="Enter alert action (email/notification/log): "

echo {"threshold": %threshold%, "endpoint": "%endpoint%", "action": "%action%"} > %alerts_dir%\response_alerts.json

echo Response time alerts configured successfully!
echo Press any key to continue...
pause > nul
goto menu

:view_alerts
cls
echo Viewing Active Alerts...
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% (
    echo No alerts configured
) else (
    echo Active Alerts:
    echo.
    for %%f in (%alerts_dir%\*_alerts.json) do (
        echo Alert Type: %%f
        type %%f
        echo.
    )
)
echo Press any key to continue...
pause > nul
goto menu

:view_history
cls
echo Viewing Historical Metrics...
echo.
set "metrics_dir=metrics"
if not exist %metrics_dir% (
    echo No metrics collected
) else (
    echo Available metric files:
    dir /b %metrics_dir%
    echo.
    set /p file="Enter metric file to view: "
    if exist %metrics_dir%\%file% (
        type %metrics_dir%\%file%
    ) else (
        echo File not found
    )
)
echo Press any key to continue...
pause > nul
goto menu

:generate_report
cls
echo Generating Metrics Report...
echo.
set "metrics_dir=metrics"
set "reports_dir=reports"
if not exist %reports_dir% mkdir %reports_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "report_file=%reports_dir%\metrics_report_%timestamp%.html"

echo Creating HTML report...
(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo ^<title^>Metrics Report - %timestamp%^</title^>
echo ^<style^>
echo body { font-family: Arial, sans-serif; margin: 20px; }
echo .metric { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
echo .alert { color: red; }
echo .normal { color: green; }
echo ^</style^>
echo ^</head^>
echo ^<body^>
echo ^<h1^>Metrics Report - %timestamp%^</h1^>
) > %report_file%

for %%f in (%metrics_dir%\*.json) do (
    echo ^<div class="metric"^> >> %report_file%
    echo ^<h2^>%%f^</h2^> >> %report_file%
    type %%f >> %report_file%
    echo ^</div^> >> %report_file%
)

(
echo ^</body^>
echo ^</html^>
) >> %report_file%

echo Report generated successfully!
echo Report location: %report_file%
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Metrics & Alerts!
echo.
pause
exit /b 0 