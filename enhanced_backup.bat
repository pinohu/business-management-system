@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Enhanced Backup System
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

:: Main menu
:menu
cls
echo Freelance Dashboard Enhanced Backup System
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
echo 11. Backup Compression & Encryption
echo 12. Backup Replication
echo 13. Backup Analytics
echo 14. Disaster Recovery
echo 15. Backup Validation
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
if "%choice%"=="11" goto compression
if "%choice%"=="12" goto replication
if "%choice%"=="13" goto analytics
if "%choice%"=="14" goto disaster_recovery
if "%choice%"=="15" goto backup_validation
if "%choice%"=="16" goto end
goto menu

:full_backup
cls
echo Creating Full System Backup
echo =========================
echo.
set "backup_dir=backups\full"
if not exist %backup_dir% mkdir %backup_dir%

:: Check disk space
call :check_space 1073741824 C:
if %errorlevel% neq 0 (
    echo [ERROR] Insufficient disk space for backup
    pause
    goto menu
)

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\full_backup_%timestamp%"
set "temp_dir=%backup_name%_temp"
set "log_file=%backup_dir%\backup_log_%timestamp%.txt"

echo Creating temporary directory...
mkdir %temp_dir%

echo Starting backup process at %date% %time% > %log_file%

echo.
echo Backing up database...
echo Backing up database... >> %log_file%
call npm run db:backup > %temp_dir%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database backup failed >> %log_file%
    echo [ERROR] Database backup failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)
echo Database backup completed successfully >> %log_file%

echo.
echo Backing up application files...
echo Backing up application files... >> %log_file%
xcopy /E /I /Y . %temp_dir%\app\ >> %log_file%
xcopy /E /I /Y node_modules %temp_dir%\node_modules\ >> %log_file%
xcopy /E /I /Y .next %temp_dir%\.next\ >> %log_file%
xcopy /E /I /Y public %temp_dir%\public\ >> %log_file%
echo Application files backup completed >> %log_file%

echo.
echo Backing up configuration...
echo Backing up configuration... >> %log_file%
xcopy /E /I /Y .env* %temp_dir%\config\ >> %log_file%
xcopy /E /I /Y prisma %temp_dir%\prisma\ >> %log_file%
echo Configuration backup completed >> %log_file%

echo.
echo Backing up user data...
echo Backing up user data... >> %log_file%
xcopy /E /I /Y data %temp_dir%\data\ >> %log_file%
echo User data backup completed >> %log_file%

echo.
echo Creating backup manifest...
echo Creating backup manifest... >> %log_file%
(
echo Backup Date: %date% %time%
echo Backup Type: Full System
echo Database: Included
echo Application: Included
echo Configuration: Included
echo User Data: Included
echo System Information:
echo - OS: %OS%
echo - Version: %OS_VERSION%
echo - Architecture: %PROCESSOR_ARCHITECTURE%
echo - Memory: %TOTAL_MEMORY%
echo - Disk Space: %FREE_SPACE%
) > %temp_dir%\manifest.txt

:: Calculate backup size
call :calc_size %temp_dir%
call :validate_size %size%

echo.
echo Compressing backup...
echo Compressing backup... >> %log_file%
7z a -t7z -mx9 %backup_name%.7z %temp_dir%\* >> %log_file%
if %errorlevel% neq 0 (
    echo [ERROR] Backup compression failed >> %log_file%
    echo [ERROR] Backup compression failed
    rmdir /s /q %temp_dir%
    pause
    goto menu
)

echo.
echo Cleaning up temporary files...
echo Cleaning up temporary files... >> %log_file%
rmdir /s /q %temp_dir%

echo Backup completed successfully at %date% %time% >> %log_file%
echo.
echo Full system backup created successfully!
echo Backup location: %backup_name%.7z
echo Log file: %log_file%
echo Press any key to continue...
pause > nul
goto menu

:app_specific
cls
echo Creating Application-Specific Backup
echo =================================
echo.
set "backup_dir=backups\app_specific"
if not exist %backup_dir% mkdir %backup_dir%

echo Select components to backup:
echo 1. Database Only
echo 2. Frontend Only
echo 3. Backend Only
echo 4. Configuration Only
echo 5. User Data Only
echo.
set /p component="Select component (1-5): "

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\app_%component%_%timestamp%"
set "temp_dir=%backup_name%_temp"
set "log_file=%backup_dir%\backup_log_%timestamp%.txt"

echo Creating temporary directory...
mkdir %temp_dir%

echo Starting application-specific backup at %date% %time% > %log_file%

if "%component%"=="1" (
    echo Backing up database...
    call npm run db:backup > %temp_dir%\database.sql
) else if "%component%"=="2" (
    echo Backing up frontend...
    xcopy /E /I /Y .next %temp_dir%\.next\
    xcopy /E /I /Y public %temp_dir%\public\
    xcopy /E /I /Y styles %temp_dir%\styles\
    xcopy /E /I /Y components %temp_dir%\components\
) else if "%component%"=="3" (
    echo Backing up backend...
    xcopy /E /I /Y pages %temp_dir%\pages\
    xcopy /E /I /Y lib %temp_dir%\lib\
    xcopy /E /I /Y prisma %temp_dir%\prisma\
) else if "%component%"=="4" (
    echo Backing up configuration...
    xcopy /E /I /Y .env* %temp_dir%\config\
    xcopy /E /I /Y prisma %temp_dir%\prisma\
) else if "%component%"=="5" (
    echo Backing up user data...
    xcopy /E /I /Y data %temp_dir%\data\
)

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Application-Specific
echo Component: %component%
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

:health_check
cls
echo Performing Backup Health Check
echo ============================
echo.
set "health_dir=backups\health"
if not exist %health_dir% mkdir %health_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "health_file=%health_dir%\health_check_%timestamp%.txt"

echo Starting backup health check at %date% %time% > %health_file%

echo.
echo Checking backup integrity...
echo Checking backup integrity... >> %health_file%
for %%f in (backups\*.7z) do (
    echo Verifying %%f...
    7z t %%f >> %health_file%
)

echo.
echo Checking backup consistency...
echo Checking backup consistency... >> %health_file%
for %%f in (backups\*.7z) do (
    echo Analyzing %%f...
    7z l %%f >> %health_file%
)

echo.
echo Checking backup age...
echo Checking backup age... >> %health_file%
for %%f in (backups\*.7z) do (
    echo Checking %%f...
    dir %%f >> %health_file%
)

echo.
echo Health check completed!
echo Results saved to: %health_file%
echo Press any key to continue...
pause > nul
goto menu

:backup_validation
cls
echo Performing Backup Validation
echo ==========================
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

echo Starting backup validation at %date% %time% > %validate_file%

echo.
echo Validating backup structure...
echo Validating backup structure... >> %validate_file%
7z l %backup% >> %validate_file%

echo.
echo Validating backup contents...
echo Validating backup contents... >> %validate_file%
7z t %backup% >> %validate_file%

echo.
echo Validating manifest...
echo Validating manifest... >> %validate_file%
7z e %backup% manifest.txt -o%validate_dir%\temp
if exist %validate_dir%\temp\manifest.txt (
    type %validate_dir%\temp\manifest.txt >> %validate_file%
) else (
    echo [ERROR] Manifest not found >> %validate_file%
)

echo.
echo Validating database backup...
echo Validating database backup... >> %validate_file%
7z e %backup% database.sql -o%validate_dir%\temp
if exist %validate_dir%\temp\database.sql (
    echo Database backup found >> %validate_file%
) else (
    echo [ERROR] Database backup not found >> %validate_file%
)

echo.
echo Cleaning up temporary files...
rmdir /s /q %validate_dir%\temp

echo.
echo Validation completed!
echo Results saved to: %validate_file%
echo Press any key to continue...
pause > nul
goto menu

:: ... (rest of the existing functions remain unchanged) ...

:end
echo.
echo Thank you for using Freelance Dashboard Enhanced Backup System!
echo.
pause
exit /b 0 