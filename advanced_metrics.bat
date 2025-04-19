@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Advanced Metrics
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
echo Freelance Dashboard Advanced Metrics
echo =================================
echo.
echo Advanced Monitoring:
echo 1. Real-time System Monitoring
echo 2. Application Performance Profiling
echo 3. Database Query Analysis
echo 4. Network Traffic Analysis
echo.
echo Custom Metrics:
echo 5. User Activity Tracking
echo 6. Error Rate Monitoring
echo 7. API Response Time Analysis
echo 8. Resource Usage Patterns
echo.
echo Reporting:
echo 9. Generate Performance Report
echo 10. Export Metrics Data
echo 11. View Historical Trends
echo 12. Configure Alert Thresholds
echo.
echo 13. Exit
echo.
set /p choice="Enter your choice (1-13): "

if "%choice%"=="1" goto realtime_monitor
if "%choice%"=="2" goto perf_profile
if "%choice%"=="3" goto query_analysis
if "%choice%"=="4" goto traffic_analysis
if "%choice%"=="5" goto user_tracking
if "%choice%"=="6" goto error_monitor
if "%choice%"=="7" goto api_analysis
if "%choice%"=="8" goto resource_patterns
if "%choice%"=="9" goto gen_report
if "%choice%"=="10" goto export_metrics
if "%choice%"=="11" goto view_trends
if "%choice%"=="12" goto config_alerts
if "%choice%"=="13" goto end
goto menu

:realtime_monitor
cls
echo Real-time System Monitoring
echo ==========================
echo.
set "metrics_dir=metrics\realtime"
if not exist %metrics_dir% mkdir %metrics_dir%

echo Starting real-time monitoring...
echo Press Ctrl+C to stop
echo.

:monitor_loop
set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "metrics_file=%metrics_dir%\system_%timestamp%.json"

:: CPU Usage
for /f "tokens=*" %%a in ('wmic cpu get loadpercentage /value ^| find "="') do (
    set "%%a"
    echo {"timestamp": "%timestamp%", "metric": "cpu_usage", "value": "%loadpercentage%"} >> %metrics_file%
)

:: Memory Usage
for /f "tokens=*" %%a in ('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /value ^| find "="') do (
    set "%%a"
    set /a "memory_usage=100 - (%FreePhysicalMemory% * 100 / %TotalVisibleMemorySize%)"
    echo {"timestamp": "%timestamp%", "metric": "memory_usage", "value": "%memory_usage%"} >> %metrics_file%
)

:: Disk I/O
for /f "tokens=*" %%a in ('wmic logicaldisk get size,freespace,caption /value ^| find "="') do (
    set "%%a"
    set /a "disk_usage=100 - (%freespace% * 100 / %size%)"
    echo {"timestamp": "%timestamp%", "metric": "disk_usage", "value": "%disk_usage%", "drive": "%caption%"} >> %metrics_file%
)

:: Network I/O
for /f "tokens=*" %%a in ('netstat -e ^| findstr /v "Interface"') do (
    set "line=%%a"
    set "bytes_received=!line:~0,20!"
    set "bytes_sent=!line:~20,20!"
    echo {"timestamp": "%timestamp%", "metric": "network_io", "received": "%bytes_received%", "sent": "%bytes_sent%"} >> %metrics_file%
)

:: Process Count
for /f "tokens=*" %%a in ('wmic process get /value ^| find /c "ProcessId"') do (
    echo {"timestamp": "%timestamp%", "metric": "process_count", "value": "%%a"} >> %metrics_file%
)

timeout /t 5 /nobreak > nul
goto monitor_loop

:perf_profile
cls
echo Application Performance Profiling
echo ===============================
echo.
set "profile_dir=profiles"
if not exist %profile_dir% mkdir %profile_dir%

echo Starting performance profiling...
echo.
echo 1. CPU Profiling
echo 2. Memory Profiling
echo 3. Network Profiling
echo 4. Database Profiling
echo.
set /p profile_type="Select profiling type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "profile_file=%profile_dir%\profile_%timestamp%.json"

if "%profile_type%"=="1" (
    echo Running CPU profiling...
    node --prof app.js
    node --prof-process --preprocess isolate-*.log > %profile_file%
) else if "%profile_type%"=="2" (
    echo Running memory profiling...
    node --heapsnapshot app.js
    move *.heapsnapshot %profile_dir%\heap_%timestamp%.heapsnapshot
) else if "%profile_type%"=="3" (
    echo Running network profiling...
    node --trace-warnings app.js > %profile_file%
) else if "%profile_type%"=="4" (
    echo Running database profiling...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] }); prisma.$queryRaw('SELECT 1').then(() => process.exit())" > %profile_file%
)

echo Profiling completed!
echo Results saved to: %profile_file%
echo Press any key to continue...
pause > nul
goto menu

:query_analysis
cls
echo Database Query Analysis
echo =====================
echo.
set "analysis_dir=analysis\queries"
if not exist %analysis_dir% mkdir %analysis_dir%

echo Starting query analysis...
echo.
echo 1. Slow Query Analysis
echo 2. Query Pattern Analysis
echo 3. Index Usage Analysis
echo 4. Connection Pool Analysis
echo.
set /p analysis_type="Select analysis type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "analysis_file=%analysis_dir%\analysis_%timestamp%.json"

if "%analysis_type%"=="1" (
    echo Analyzing slow queries...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT * FROM pg_stat_activity WHERE state = ''active'' ORDER BY query_start DESC LIMIT 10').then(console.log)" > %analysis_file%
) else if "%analysis_type%"=="2" (
    echo Analyzing query patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10').then(console.log)" > %analysis_file%
) else if "%analysis_type%"=="3" (
    echo Analyzing index usage...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan DESC').then(console.log)" > %analysis_file%
) else if "%analysis_type%"=="4" (
    echo Analyzing connection pool...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT count(*) as active_connections FROM pg_stat_activity').then(console.log)" > %analysis_file%
)

echo Analysis completed!
echo Results saved to: %analysis_file%
echo Press any key to continue...
pause > nul
goto menu

:traffic_analysis
cls
echo Network Traffic Analysis
echo ======================
echo.
set "traffic_dir=analysis\traffic"
if not exist %traffic_dir% mkdir %traffic_dir%

echo Starting traffic analysis...
echo.
echo 1. Real-time Traffic Monitor
echo 2. Traffic Pattern Analysis
echo 3. Connection Analysis
echo 4. Bandwidth Usage Analysis
echo.
set /p traffic_type="Select analysis type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "traffic_file=%traffic_dir%\traffic_%timestamp%.json"

if "%traffic_type%"=="1" (
    echo Starting real-time traffic monitoring...
    echo Press Ctrl+C to stop
    :traffic_loop
    netstat -n ^| find /c "ESTABLISHED" > %traffic_file%
    netstat -n ^| find /c "LISTENING" >> %traffic_file%
    timeout /t 5 /nobreak > nul
    goto traffic_loop
) else if "%traffic_type%"=="2" (
    echo Analyzing traffic patterns...
    netstat -n ^| find /c "ESTABLISHED" > %traffic_file%
    netstat -n ^| find /c "LISTENING" >> %traffic_file%
    netstat -n ^| find /c "TIME_WAIT" >> %traffic_file%
    netstat -n ^| find /c "CLOSE_WAIT" >> %traffic_file%
) else if "%traffic_type%"=="3" (
    echo Analyzing connections...
    netstat -ano ^| find "ESTABLISHED" > %traffic_file%
) else if "%traffic_type%"=="4" (
    echo Analyzing bandwidth usage...
    netstat -e ^| find /v "Interface" > %traffic_file%
)

echo Analysis completed!
echo Results saved to: %traffic_file%
echo Press any key to continue...
pause > nul
goto menu

:user_tracking
cls
echo User Activity Tracking
echo ====================
echo.
set "tracking_dir=metrics\user_activity"
if not exist %tracking_dir% mkdir %tracking_dir%

echo Starting user activity tracking...
echo.
echo 1. Active Users
echo 2. User Actions
echo 3. Session Duration
echo 4. Feature Usage
echo.
set /p tracking_type="Select tracking type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "tracking_file=%tracking_dir%\activity_%timestamp%.json"

if "%tracking_type%"=="1" (
    echo Tracking active users...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT COUNT(*) as active_users FROM sessions WHERE last_active > NOW() - INTERVAL ''5 minutes''').then(console.log)" > %tracking_file%
) else if "%tracking_type%"=="2" (
    echo Tracking user actions...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT action, COUNT(*) as count FROM user_actions GROUP BY action ORDER BY count DESC LIMIT 10').then(console.log)" > %tracking_file%
) else if "%tracking_type%"=="3" (
    echo Tracking session duration...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration FROM sessions').then(console.log)" > %tracking_file%
) else if "%tracking_type%"=="4" (
    echo Tracking feature usage...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT feature, COUNT(*) as usage_count FROM feature_usage GROUP BY feature ORDER BY usage_count DESC').then(console.log)" > %tracking_file%
)

echo Tracking completed!
echo Results saved to: %tracking_file%
echo Press any key to continue...
pause > nul
goto menu

:error_monitor
cls
echo Error Rate Monitoring
echo ===================
echo.
set "error_dir=metrics\errors"
if not exist %error_dir% mkdir %error_dir%

echo Starting error monitoring...
echo.
echo 1. Real-time Error Tracking
echo 2. Error Pattern Analysis
echo 3. Error Impact Assessment
echo 4. Error Resolution Time
echo.
set /p error_type="Select monitoring type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "error_file=%error_dir%\errors_%timestamp%.json"

if "%error_type%"=="1" (
    echo Starting real-time error tracking...
    echo Press Ctrl+C to stop
    :error_loop
    type logs\error.log | find /c "ERROR" > %error_file%
    type logs\error.log | find /c "WARN" >> %error_file%
    timeout /t 5 /nobreak > nul
    goto error_loop
) else if "%error_type%"=="2" (
    echo Analyzing error patterns...
    type logs\error.log | find /c "ERROR" > %error_file%
    type logs\error.log | find /c "WARN" >> %error_file%
    type logs\error.log | find /c "FATAL" >> %error_file%
) else if "%error_type%"=="3" (
    echo Assessing error impact...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT error_type, COUNT(*) as count, AVG(impact_score) as avg_impact FROM error_logs GROUP BY error_type').then(console.log)" > %error_file%
) else if "%error_type%"=="4" (
    echo Analyzing error resolution time...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time FROM error_logs').then(console.log)" > %error_file%
)

echo Monitoring completed!
echo Results saved to: %error_file%
echo Press any key to continue...
pause > nul
goto menu

:api_analysis
cls
echo API Response Time Analysis
echo =========================
echo.
set "api_dir=metrics\api"
if not exist %api_dir% mkdir %api_dir%

echo Starting API analysis...
echo.
echo 1. Endpoint Response Times
echo 2. API Usage Patterns
echo 3. Error Rate by Endpoint
echo 4. API Performance Trends
echo.
set /p api_type="Select analysis type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "api_file=%api_dir%\api_%timestamp%.json"

if "%api_type%"=="1" (
    echo Analyzing endpoint response times...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT endpoint, AVG(response_time) as avg_time FROM api_logs GROUP BY endpoint').then(console.log)" > %api_file%
) else if "%api_type%"=="2" (
    echo Analyzing API usage patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT endpoint, COUNT(*) as calls FROM api_logs GROUP BY endpoint ORDER BY calls DESC').then(console.log)" > %api_file%
) else if "%api_type%"=="3" (
    echo Analyzing error rates by endpoint...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT endpoint, COUNT(*) as error_count FROM api_logs WHERE status_code >= 400 GROUP BY endpoint').then(console.log)" > %api_file%
) else if "%api_type%"=="4" (
    echo Analyzing API performance trends...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT DATE_TRUNC(''hour'', timestamp) as hour, AVG(response_time) as avg_time FROM api_logs GROUP BY hour ORDER BY hour DESC LIMIT 24').then(console.log)" > %api_file%
)

echo Analysis completed!
echo Results saved to: %api_file%
echo Press any key to continue...
pause > nul
goto menu

:resource_patterns
cls
echo Resource Usage Patterns
echo =====================
echo.
set "resource_dir=metrics\resources"
if not exist %resource_dir% mkdir %resource_dir%

echo Starting resource pattern analysis...
echo.
echo 1. CPU Usage Patterns
echo 2. Memory Usage Patterns
echo 3. Disk I/O Patterns
echo 4. Network Usage Patterns
echo.
set /p pattern_type="Select pattern type (1-4): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "pattern_file=%resource_dir%\patterns_%timestamp%.json"

if "%pattern_type%"=="1" (
    echo Analyzing CPU usage patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT DATE_TRUNC(''hour'', timestamp) as hour, AVG(cpu_usage) as avg_cpu FROM system_metrics GROUP BY hour ORDER BY hour DESC LIMIT 24').then(console.log)" > %pattern_file%
) else if "%pattern_type%"=="2" (
    echo Analyzing memory usage patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT DATE_TRUNC(''hour'', timestamp) as hour, AVG(memory_usage) as avg_memory FROM system_metrics GROUP BY hour ORDER BY hour DESC LIMIT 24').then(console.log)" > %pattern_file%
) else if "%pattern_type%"=="3" (
    echo Analyzing disk I/O patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT DATE_TRUNC(''hour'', timestamp) as hour, AVG(disk_io) as avg_io FROM system_metrics GROUP BY hour ORDER BY hour DESC LIMIT 24').then(console.log)" > %pattern_file%
) else if "%pattern_type%"=="4" (
    echo Analyzing network usage patterns...
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$queryRaw('SELECT DATE_TRUNC(''hour'', timestamp) as hour, AVG(network_usage) as avg_network FROM system_metrics GROUP BY hour ORDER BY hour DESC LIMIT 24').then(console.log)" > %pattern_file%
)

echo Analysis completed!
echo Results saved to: %pattern_file%
echo Press any key to continue...
pause > nul
goto menu

:gen_report
cls
echo Generating Performance Report
echo ===========================
echo.
set "reports_dir=reports"
if not exist %reports_dir% mkdir %reports_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "report_file=%reports_dir%\performance_report_%timestamp%.html"

echo Creating HTML report...
(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo ^<title^>Performance Report - %timestamp%^</title^>
echo ^<style^>
echo body { font-family: Arial, sans-serif; margin: 20px; }
echo .metric { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
echo .alert { color: red; }
echo .normal { color: green; }
echo .chart { margin: 20px 0; }
echo ^</style^>
echo ^</head^>
echo ^<body^>
echo ^<h1^>Performance Report - %timestamp%^</h1^>
) > %report_file%

:: System Metrics
echo ^<h2^>System Metrics^</h2^> >> %report_file%
for %%f in (metrics\realtime\*.json) do (
    echo ^<div class="metric"^> >> %report_file%
    echo ^<h3^>%%f^</h3^> >> %report_file%
    type %%f >> %report_file%
    echo ^</div^> >> %report_file%
)

:: Application Metrics
echo ^<h2^>Application Metrics^</h2^> >> %report_file%
for %%f in (metrics\app\*.json) do (
    echo ^<div class="metric"^> >> %report_file%
    echo ^<h3^>%%f^</h3^> >> %report_file%
    type %%f >> %report_file%
    echo ^</div^> >> %report_file%
)

:: Database Metrics
echo ^<h2^>Database Metrics^</h2^> >> %report_file%
for %%f in (metrics\db\*.json) do (
    echo ^<div class="metric"^> >> %report_file%
    echo ^<h3^>%%f^</h3^> >> %report_file%
    type %%f >> %report_file%
    echo ^</div^> >> %report_file%
)

:: Network Metrics
echo ^<h2^>Network Metrics^</h2^> >> %report_file%
for %%f in (metrics\network\*.json) do (
    echo ^<div class="metric"^> >> %report_file%
    echo ^<h3^>%%f^</h3^> >> %report_file%
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

:export_metrics
cls
echo Exporting Metrics Data
echo ====================
echo.
set "export_dir=exports"
if not exist %export_dir% mkdir %export_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "export_file=%export_dir%\metrics_%timestamp%.zip"

echo Creating export package...
7z a -tzip %export_file% metrics\* profiles\* analysis\* reports\*

echo Export completed!
echo Export location: %export_file%
echo Press any key to continue...
pause > nul
goto menu

:view_trends
cls
echo Viewing Historical Trends
echo =======================
echo.
set "trends_dir=metrics\trends"
if not exist %trends_dir% mkdir %trends_dir%

echo Available trend data:
dir /b %trends_dir%
echo.
set /p trend_file="Enter trend file to view: "

if exist %trends_dir%\%trend_file% (
    type %trends_dir%\%trend_file%
) else (
    echo File not found
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:config_alerts
cls
echo Configuring Alert Thresholds
echo ==========================
echo.
set "alerts_dir=alerts"
if not exist %alerts_dir% mkdir %alerts_dir%

echo Current alert settings:
if exist %alerts_dir%\thresholds.json (
    type %alerts_dir%\thresholds.json
) else (
    echo No alert thresholds configured
)

echo.
echo 1. CPU Threshold
echo 2. Memory Threshold
echo 3. Disk Threshold
echo 4. Response Time Threshold
echo.
set /p alert_type="Select alert type (1-4): "

if "%alert_type%"=="1" (
    set /p threshold="Enter CPU usage threshold (1-100): "
    echo {"alert_type": "cpu", "threshold": %threshold%} > %alerts_dir%\thresholds.json
) else if "%alert_type%"=="2" (
    set /p threshold="Enter memory usage threshold (1-100): "
    echo {"alert_type": "memory", "threshold": %threshold%} > %alerts_dir%\thresholds.json
) else if "%alert_type%"=="3" (
    set /p threshold="Enter disk usage threshold (1-100): "
    echo {"alert_type": "disk", "threshold": %threshold%} > %alerts_dir%\thresholds.json
) else if "%alert_type%"=="4" (
    set /p threshold="Enter response time threshold in seconds: "
    echo {"alert_type": "response_time", "threshold": %threshold%} > %alerts_dir%\thresholds.json
)

echo Alert thresholds updated successfully!
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Advanced Metrics!
echo.
pause
exit /b 0 