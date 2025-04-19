@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Advanced Backup System
echo =======================================

:: Function to check if a command exists
:check_command
where %1 >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] %1 is not installed or not in PATH
    exit /b 1
)
exit /b 0

:: Function to validate backup size
:validate_size
set "size=%1"
if %size% gtr 1073741824 (
    echo [WARNING] Backup size exceeds 1GB
    set /p confirm="Continue? (Y/N): "
    if /i not "%confirm%"=="Y" exit /b 1
)
exit /b 0

:: Function to calculate backup size
:calc_size
set "path=%1"
set "size=0"
for %%f in (%path%\*) do (
    set /a "size+=%%~zf"
)
exit /b %size%

:: Function to check disk space
:check_space
set "required=%1"
set "drive=%2"
for /f "tokens=3" %%a in ('dir /-c %drive% ^| find "bytes free"') do (
    if %%a lss %required% (
        echo [ERROR] Insufficient disk space
        exit /b 1
    )
)
exit /b 0

:: Function to generate encryption key
:generate_key
set "key_file=%1"
openssl rand -base64 32 > %key_file%
exit /b 0

:: Function to compress with advanced options
:compress_advanced
set "source=%1"
set "target=%2"
set "method=%3"
set "level=%4"
set "encrypt=%5"
set "key_file=%6"

if "%method%"=="lzma2" (
    if "%encrypt%"=="true" (
        7z a -t7z -m0=lzma2 -mx=%level% -p%key_file% %target% %source%\*
    ) else (
        7z a -t7z -m0=lzma2 -mx=%level% %target% %source%\*
    )
) else if "%method%"=="ppmd" (
    if "%encrypt%"=="true" (
        7z a -t7z -m0=ppmd -mx=%level% -p%key_file% %target% %source%\*
    ) else (
        7z a -t7z -m0=ppmd -mx=%level% %target% %source%\*
    )
) else if "%method%"=="bzip2" (
    if "%encrypt%"=="true" (
        7z a -t7z -m0=bzip2 -mx=%level% -p%key_file% %target% %source%\*
    ) else (
        7z a -t7z -m0=bzip2 -mx=%level% %target% %source%\*
    )
)
exit /b 0

:: Function to analyze backup performance
:analyze_performance
set "backup_file=%1"
set "report_file=%2"
echo Analyzing backup performance... > %report_file%
echo ============================== >> %report_file%
echo. >> %report_file%

echo Backup Details: >> %report_file%
7z l %backup_file% >> %report_file%
echo. >> %report_file%

echo Compression Ratio: >> %report_file%
7z i %backup_file% | findstr "Compression" >> %report_file%
echo. >> %report_file%

echo Processing Time: >> %report_file%
echo Start: %start_time% >> %report_file%
echo End: %end_time% >> %report_file%
echo. >> %report_file%

echo Resource Usage: >> %report_file%
wmic process where "name='7z.exe'" get WorkingSetSize,CPU >> %report_file%
exit /b 0

:: Function to validate backup integrity
:validate_integrity
set "backup_file=%1"
set "report_file=%2"
echo Validating backup integrity... > %report_file%
echo ============================== >> %report_file%
echo. >> %report_file%

echo Testing archive integrity... >> %report_file%
7z t %backup_file% >> %report_file%
echo. >> %report_file%

echo Checking file structure... >> %report_file%
7z l %backup_file% >> %report_file%
echo. >> %report_file%

echo Verifying checksums... >> %report_file%
7z h %backup_file% >> %report_file%
exit /b 0

:: Main menu
:menu
cls
echo Freelance Dashboard Advanced Backup System
echo =======================================
echo.
echo Backup Options:
echo 1. Create Full System Backup
echo 2. Create Incremental Backup
echo 3. Create Differential Backup
echo 4. Create Point-in-Time Recovery Backup
echo 5. Create Application-Specific Backup
echo.
echo Management:
echo 6. Schedule Automated Backups
echo 7. Manage Backup Retention
echo 8. Verify Backup Integrity
echo 9. Restore from Backup
echo 10. Backup Health Check
echo.
echo Advanced:
echo 11. Advanced Compression & Encryption
echo 12. Backup Replication
echo 13. Advanced Analytics
echo 14. Enhanced Disaster Recovery
echo 15. Comprehensive Validation
echo.
echo 16. Exit
echo.
set /p choice="Enter your choice (1-16): "

if "%choice%"=="1" goto full_backup
if "%choice%"=="2" goto incremental_backup
if "%choice%"=="3" goto differential_backup
if "%choice%"=="4" goto point_in_time
if "%choice%"=="5" goto app_specific
if "%choice%"=="6" goto schedule_backup
if "%choice%"=="7" goto retention
if "%choice%"=="8" goto verify_backup
if "%choice%"=="9" goto restore_backup
if "%choice%"=="10" goto health_check
if "%choice%"=="11" goto advanced_compression
if "%choice%"=="12" goto replication
if "%choice%"=="13" goto advanced_analytics
if "%choice%"=="14" goto enhanced_recovery
if "%choice%"=="15" goto comprehensive_validation
if "%choice%"=="16" goto end
goto menu

:full_backup
cls
echo Creating Full System Backup
echo =========================
echo.
set "backup_dir=backups\full"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\full_backup_%timestamp%"
set "temp_dir=%backup_name%_temp"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Backing up database...
call npm run db:backup > %temp_dir%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database backup failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)

echo.
echo Backing up application files...
xcopy /E /I /Y . %temp_dir%\app\
xcopy /E /I /Y node_modules %temp_dir%\node_modules\
xcopy /E /I /Y .next %temp_dir%\.next\
xcopy /E /I /Y public %temp_dir%\public\

echo.
echo Backing up configuration...
xcopy /E /I /Y .env* %temp_dir%\config\
xcopy /E /I /Y prisma %temp_dir%\prisma\

echo.
echo Backing up user data...
xcopy /E /I /Y data %temp_dir%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Full System
echo Database: Included
echo Application: Included
echo Configuration: Included
echo User Data: Included
) > %temp_dir%\manifest.txt

echo.
echo Compressing backup...
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Full system backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:incremental_backup
cls
echo Creating Incremental Backup
echo ==========================
echo.
set "backup_dir=backups\incremental"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\incremental_%timestamp%"
set "temp_dir=%backup_name%_temp"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Finding modified files since last backup...
for /f "tokens=*" %%f in ('dir /s /b /a-d ^| findstr /v "node_modules .next"') do (
    if not exist "backups\full\%%f" (
        xcopy /Y "%%f" "%temp_dir%\%%f"
    )
)

echo.
echo Backing up database changes...
call npm run db:backup -- --incremental > %temp_dir%\database_changes.sql
if %errorlevel% neq 0 (
    echo [ERROR] Incremental database backup failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Incremental
echo Changes Since: %last_backup%
) > %temp_dir%\manifest.txt

echo.
echo Compressing backup...
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Incremental backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:differential_backup
cls
echo Creating Differential Backup
echo ===========================
echo.
set "backup_dir=backups\differential"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\differential_%timestamp%"
set "temp_dir=%backup_name%_temp"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Finding files changed since last full backup...
for /f "tokens=*" %%f in ('dir /s /b /a-d ^| findstr /v "node_modules .next"') do (
    if not exist "backups\full\%%f" (
        xcopy /Y "%%f" "%temp_dir%\%%f"
    )
)

echo.
echo Backing up database changes since last full backup...
call npm run db:backup -- --differential > %temp_dir%\database_changes.sql
if %errorlevel% neq 0 (
    echo [ERROR] Differential database backup failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Differential
echo Base Backup: %last_full_backup%
) > %temp_dir%\manifest.txt

echo.
echo Compressing backup...
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Differential backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:point_in_time
cls
echo Creating Point-in-Time Recovery Backup
echo ===================================
echo.
set "backup_dir=backups\point_in_time"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\pitr_%timestamp%"
set "temp_dir=%backup_name%_temp"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Backing up database to specific point in time...
call npm run db:backup -- --point-in-time > %temp_dir%\database_pitr.sql
if %errorlevel% neq 0 (
    echo [ERROR] Point-in-time recovery backup failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)

echo.
echo Backing up application state...
xcopy /E /I /Y . %temp_dir%\app\
xcopy /E /I /Y .env* %temp_dir%\config\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Point-in-Time Recovery
echo Recovery Point: %timestamp%
) > %temp_dir%\manifest.txt

echo.
echo Compressing backup...
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Point-in-time recovery backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:app_specific
cls
echo Creating Application-Specific Backup
echo ================================
echo.
set "backup_dir=backups\app_specific"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\app_specific_%timestamp%"
set "temp_dir=%backup_name%_temp"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Backing up application-specific data...
xcopy /E /I /Y . %temp_dir%\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Application-Specific
echo Data: Included
) > %temp_dir%\manifest.txt

echo.
echo Compressing backup...
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Application-specific backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:schedule_backup
cls
echo Scheduling Automated Backups
echo ==========================
echo.
set "schedule_dir=backups\schedule"
if not exist %schedule_dir% mkdir %schedule_dir%

echo Current backup schedule:
if exist %schedule_dir%\schedule.json (
    type %schedule_dir%\schedule.json
) else (
    echo No backup schedule configured
)

echo.
echo 1. Daily Backup
echo 2. Weekly Backup
echo 3. Monthly Backup
echo.
set /p schedule_type="Select schedule type (1-3): "

if "%schedule_type%"=="1" (
    set /p time="Enter backup time (HH:MM): "
    echo {"type": "daily", "time": "%time%"} > %schedule_dir%\schedule.json
) else if "%schedule_type%"=="2" (
    set /p day="Enter backup day (1-7): "
    set /p time="Enter backup time (HH:MM): "
    echo {"type": "weekly", "day": %day%, "time": "%time%"} > %schedule_dir%\schedule.json
) else if "%schedule_type%"=="3" (
    set /p day="Enter backup day (1-31): "
    set /p time="Enter backup time (HH:MM): "
    echo {"type": "monthly", "day": %day%, "time": "%time%"} > %schedule_dir%\schedule.json
)

echo.
echo Creating scheduled task...
schtasks /create /tn "FreelanceDashboardBackup" /tr "%~dp0backup.bat" /sc %schedule_type% /st %time% /f

echo.
echo Backup schedule configured successfully!
echo Press any key to continue...
pause > nul
goto menu

:retention
cls
echo Managing Backup Retention
echo =======================
echo.
set "retention_dir=backups\retention"
if not exist %retention_dir% mkdir %retention_dir%

echo Current retention policy:
if exist %retention_dir%\policy.json (
    type %retention_dir%\policy.json
) else (
    echo No retention policy configured
)

echo.
echo 1. Configure Retention Period
echo 2. Apply Retention Policy
echo 3. View Retained Backups
echo.
set /p retention_action="Select action (1-3): "

if "%retention_action%"=="1" (
    set /p full_days="Enter full backup retention period (days): "
    set /p incremental_days="Enter incremental backup retention period (days): "
    set /p differential_days="Enter differential backup retention period (days): "
    echo {"full": %full_days%, "incremental": %incremental_days%, "differential": %differential_days%} > %retention_dir%\policy.json
) else if "%retention_action%"=="2" (
    echo Applying retention policy...
    forfiles /p "backups\full" /s /m *.7z /d -%full_days% /c "cmd /c del @path"
    forfiles /p "backups\incremental" /s /m *.7z /d -%incremental_days% /c "cmd /c del @path"
    forfiles /p "backups\differential" /s /m *.7z /d -%differential_days% /c "cmd /c del @path"
) else if "%retention_action%"=="3" (
    echo Retained Backups:
    echo.
    echo Full Backups:
    dir /b "backups\full"
    echo.
    echo Incremental Backups:
    dir /b "backups\incremental"
    echo.
    echo Differential Backups:
    dir /b "backups\differential"
)

echo.
echo Retention management completed!
echo Press any key to continue...
pause > nul
goto menu

:verify_backup
cls
echo Verifying Backup Integrity
echo =========================
echo.
set "verify_dir=backups\verify"
if not exist %verify_dir% mkdir %verify_dir%

echo Available backups:
dir /b backups\*.7z
echo.
set /p backup="Enter backup file to verify: "

if not exist %backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup integrity...
7z t %backup%
if %errorlevel% neq 0 (
    echo [ERROR] Backup verification failed
) else (
    echo Backup verification successful!
)

echo.
echo Checking backup contents...
7z l %backup%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to list backup contents
) else (
    echo Backup contents verified successfully!
)

echo.
echo Press any key to continue...
pause > nul
goto menu

:restore_backup
cls
echo Restoring from Backup
echo ====================
echo.
set "restore_dir=backups\restore"
if not exist %restore_dir% mkdir %restore_dir%

echo Available backups:
dir /b backups\*.7z
echo.
set /p backup="Enter backup file to restore: "

if not exist %backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Extracting backup...
7z x %backup% -o%restore_dir%

echo.
echo Verifying backup contents...
if not exist %restore_dir%\manifest.txt (
    echo [ERROR] Invalid backup: manifest not found
    rmdir /s /q %restore_dir%
    pause
    goto menu
)

echo.
echo Restoring database...
call npm run db:restore < %restore_dir%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database restore failed
    rmdir /s /q %restore_dir%
    pause
    goto menu
)

echo.
echo Restoring application files...
xcopy /E /I /Y %restore_dir%\app\* .
xcopy /E /I /Y %restore_dir%\node_modules\* node_modules\
xcopy /E /I /Y %restore_dir%\.next\* .next\
xcopy /E /I /Y %restore_dir%\public\* public\

echo.
echo Restoring configuration...
xcopy /E /I /Y %restore_dir%\config\* .
xcopy /E /I /Y %restore_dir%\prisma\* prisma\

echo.
echo Restoring user data...
xcopy /E /I /Y %restore_dir%\data\* data\

echo.
echo Cleaning up temporary files...
rmdir /s /q %restore_dir%

echo.
echo Backup restored successfully!
echo Press any key to continue...
pause > nul
goto menu

:health_check
cls
echo Backup Health Check
echo ==================
echo.
set "check_dir=backups\check"
if not exist %check_dir% mkdir %check_dir%

echo 1. Check Backup Size
echo 2. Check Disk Space
echo 3. Check Backup Frequency
echo.
set /p health_check_action="Select action (1-3): "

if "%health_check_action%"=="1" (
    echo Checking backup size...
    for %%f in (backups\*.7z) do (
        call :calc_size %%f >> %check_dir%\backup_size.txt
    )
) else if "%health_check_action%"=="2" (
    echo Checking disk space...
    for %%f in (backups\*.7z) do (
        call :check_space 104857600 %%f >> %check_dir%\disk_space.txt
    )
) else if "%health_check_action%"=="3" (
    echo Checking backup frequency...
    echo Current backup schedule:
    if exist backups\schedule\schedule.json (
        type backups\schedule\schedule.json
    ) else (
        echo No backup schedule configured
    )
)

echo.
echo Health check completed!
echo Results saved to: %check_dir%\*
echo Press any key to continue...
pause > nul
goto menu

:advanced_compression
cls
echo Advanced Compression & Encryption
echo ===============================
echo.
set "secure_dir=backups\secure"
if not exist %secure_dir% mkdir %secure_dir%

echo Select compression method:
echo 1. LZMA2 (Best compression)
echo 2. PPMD (Fast compression)
echo 3. BZIP2 (Balanced)
echo.
set /p method="Select method (1-3): "

echo.
echo Select compression level (1-9):
set /p level="Enter level (1-9): "

echo.
echo Enable encryption?
set /p encrypt="Yes/No: "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%secure_dir%\secure_%timestamp%"
set "temp_dir=%backup_name%_temp"
set "key_file=%secure_dir%\keys\key_%timestamp%.key"

echo Creating temporary directory...
mkdir %temp_dir%

echo.
echo Backing up data...
xcopy /E /I /Y . %temp_dir%\

if "%encrypt%"=="Yes" (
    echo Generating encryption key...
    call :generate_key %key_file%
)

echo.
echo Compressing with advanced options...
if "%method%"=="1" (
    call :compress_advanced %temp_dir% %backup_name%.7z lzma2 %level% %encrypt% %key_file%
) else if "%method%"=="2" (
    call :compress_advanced %temp_dir% %backup_name%.7z ppmd %level% %encrypt% %key_file%
) else if "%method%"=="3" (
    call :compress_advanced %temp_dir% %backup_name%.7z bzip2 %level% %encrypt% %key_file%
)

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Advanced backup created successfully!
echo Backup location: %backup_name%.7z
if "%encrypt%"=="Yes" (
    echo Key file: %key_file%
)
echo Press any key to continue...
pause > nul
goto menu

:replication
cls
echo Backup Replication
echo ================
echo.
set "replicate_dir=backups\replicate"
if not exist %replicate_dir% mkdir %replicate_dir%

echo 1. Configure Replication Target
echo 2. Start Replication
echo 3. Monitor Replication Status
echo.
set /p replicate_action="Select action (1-3): "

if "%replicate_action%"=="1" (
    echo Enter replication target details:
    set /p target_host="Host: "
    set /p target_user="Username: "
    set /p target_path="Path: "
    echo {"host": "%target_host%", "user": "%target_user%", "path": "%target_path%"} > %replicate_dir%\target.json
) else if "%replicate_action%"=="2" (
    echo Starting backup replication...
    for %%f in (backups\*.7z) do (
        scp %%f %target_user%@%target_host%:%target_path%
    )
) else if "%replicate_action%"=="3" (
    echo Checking replication status...
    ssh %target_user%@%target_host% "ls -l %target_path%"
)

echo.
echo Replication completed!
echo Press any key to continue...
pause > nul
goto menu

:advanced_analytics
cls
echo Advanced Backup Analytics
echo =======================
echo.
set "analytics_dir=backups\analytics"
if not exist %analytics_dir% mkdir %analytics_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "analytics_file=%analytics_dir%\analytics_%timestamp%.json"

echo Starting advanced analytics at %date% %time% > %analytics_file%

echo.
echo Analyzing backup patterns...
echo { > %analytics_file%
echo   "timestamp": "%timestamp%", >> %analytics_file%
echo   "backups": [ >> %analytics_file%

for %%f in (backups\*.7z) do (
    echo Analyzing %%f...
    echo { >> %analytics_file%
    echo   "file": "%%f", >> %analytics_file%
    echo   "size": "%%~zf", >> %analytics_file%
    echo   "date": "%%~tf", >> %analytics_file%
    echo   "compression": "%%~xf", >> %analytics_file%
    echo   "integrity": "%%~af" >> %analytics_file%
    echo }, >> %analytics_file%
)

echo.
echo Generating performance metrics...
echo   "performance": { >> %analytics_file%
echo     "total_size": "%total_size%", >> %analytics_file%
echo     "average_size": "%avg_size%", >> %analytics_file%
echo     "compression_ratio": "%comp_ratio%", >> %analytics_file%
echo     "backup_frequency": "%backup_freq%" >> %analytics_file%
echo   } >> %analytics_file%
echo } >> %analytics_file%

echo.
echo Analytics completed!
echo Results saved to: %analytics_file%
echo Press any key to continue...
pause > nul
goto menu

:enhanced_recovery
cls
echo Enhanced Disaster Recovery
echo ========================
echo.
set "recovery_dir=backups\recovery"
if not exist %recovery_dir% mkdir %recovery_dir%

echo 1. Create Recovery Plan
echo 2. Test Recovery Process
echo 3. Execute Recovery
echo 4. Validate Recovery
echo.
set /p recovery_action="Select action (1-4): "

if "%recovery_action%"=="1" (
    echo Creating recovery plan...
    (
    echo Recovery Plan
    echo =============
    echo.
    echo 1. System Requirements
    echo - Node.js 18.0.0 or higher
    echo - PostgreSQL 14.0 or higher
    echo - 8GB RAM minimum
    echo - 50GB free disk space
    echo.
    echo 2. Recovery Steps
    echo a. Verify backup integrity
    echo b. Restore database from backup
    echo c. Restore application files
    echo d. Restore configuration
    echo e. Verify system integrity
    echo f. Test application functionality
    echo.
    echo 3. Contact Information
    echo - System Administrator: admin@example.com
    echo - Database Administrator: dba@example.com
    echo - Emergency Contact: emergency@example.com
    echo.
    echo 4. Recovery Time Objectives
    echo - Maximum Recovery Time: 4 hours
    echo - Maximum Data Loss: 1 hour
    echo.
    echo 5. Validation Steps
    echo a. Database consistency check
    echo b. Application health check
    echo c. Performance benchmark
    echo d. Security audit
    ) > %recovery_dir%\recovery_plan.txt
) else if "%recovery_action%"=="2" (
    echo Testing recovery process...
    echo 1. Verifying backup integrity...
    7z t backups\*.7z
    echo 2. Testing database restore...
    call npm run db:restore -- --test
    echo 3. Verifying application files...
    dir /s /b .
    echo 4. Testing application functionality...
    call npm run test
) else if "%recovery_action%"=="3" (
    echo Executing recovery process...
    echo 1. Restoring database...
    call npm run db:restore
    echo 2. Restoring application files...
    xcopy /E /I /Y backups\latest\* .
    echo 3. Restoring configuration...
    xcopy /E /I /Y backups\latest\config\* .
    echo 4. Verifying system...
    call npm run verify
) else if "%recovery_action%"=="4" (
    echo Validating recovery...
    echo 1. Checking database consistency...
    call npm run db:check
    echo 2. Verifying application health...
    call npm run health-check
    echo 3. Running performance tests...
    call npm run benchmark
    echo 4. Conducting security audit...
    call npm run security-audit
)

echo.
echo Recovery process completed!
echo Press any key to continue...
pause > nul
goto menu

:comprehensive_validation
cls
echo Comprehensive Backup Validation
echo ============================
echo.
set "validate_dir=backups\validate"
if not exist %validate_dir% mkdir %validate_dir%

echo Available backups:
dir /b backups\*.7z
echo.
set /p backup="Enter backup file to validate: "

if not exist %backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "validate_file=%validate_dir%\validation_%timestamp%.txt"

echo Starting comprehensive validation at %date% %time% > %validate_file%

echo.
echo 1. Validating backup structure...
echo Validating backup structure... >> %validate_file%
7z l %backup% >> %validate_file%

echo.
echo 2. Validating backup contents...
echo Validating backup contents... >> %validate_file%
7z t %backup% >> %validate_file%

echo.
echo 3. Validating manifest...
echo Validating manifest... >> %validate_file%
7z e %backup% manifest.txt -o%validate_dir%\temp
if exist %validate_dir%\temp\manifest.txt (
    type %validate_dir%\temp\manifest.txt >> %validate_file%
) else (
    echo [ERROR] Manifest not found >> %validate_file%
)

echo.
echo 4. Validating database backup...
echo Validating database backup... >> %validate_file%
7z e %backup% database.sql -o%validate_dir%\temp
if exist %validate_dir%\temp\database.sql (
    echo Database backup found >> %validate_file%
    echo Validating database schema... >> %validate_file%
    call npm run db:validate < %validate_dir%\temp\database.sql >> %validate_file%
) else (
    echo [ERROR] Database backup not found >> %validate_file%
)

echo.
echo 5. Validating application files...
echo Validating application files... >> %validate_file%
7z e %backup% app -o%validate_dir%\temp
if exist %validate_dir%\temp\app (
    echo Application files found >> %validate_file%
    echo Checking file integrity... >> %validate_file%
    for /f "tokens=*" %%f in ('dir /s /b %validate_dir%\temp\app') do (
        echo Validating %%f... >> %validate_file%
        certutil -hashfile "%%f" MD5 >> %validate_file%
    )
) else (
    echo [ERROR] Application files not found >> %validate_file%
)

echo.
echo 6. Validating configuration...
echo Validating configuration... >> %validate_file%
7z e %backup% config -o%validate_dir%\temp
if exist %validate_dir%\temp\config (
    echo Configuration files found >> %validate_file%
    echo Checking configuration validity... >> %validate_file%
    type %validate_dir%\temp\config\* >> %validate_file%
) else (
    echo [ERROR] Configuration files not found >> %validate_file%
)

echo.
echo 7. Validating security...
echo Validating security... >> %validate_file%
echo Checking for sensitive data... >> %validate_file%
findstr /i "password secret key token" %validate_dir%\temp\* >> %validate_file%

echo.
echo 8. Validating dependencies...
echo Validating dependencies... >> %validate_file%
if exist %validate_dir%\temp\package.json (
    echo Checking package.json... >> %validate_file%
    type %validate_dir%\temp\package.json >> %validate_file%
) else (
    echo [ERROR] package.json not found >> %validate_file%
)

echo.
echo Cleaning up temporary files...
rmdir /s /q %validate_dir%\temp

echo.
echo Comprehensive validation completed!
echo Results saved to: %validate_file%
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Advanced Backup System!
echo.
pause
exit /b 0 