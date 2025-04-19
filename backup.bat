@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Backup & Restore
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
echo Freelance Dashboard Backup & Restore
echo =================================
echo.
echo Backup Options:
echo 1. Full Backup (All Data)
echo 2. Database Backup
echo 3. Configuration Backup
echo 4. User Data Backup
echo.
echo Restore Options:
echo 5. Restore Full Backup
echo 6. Restore Database
echo 7. Restore Configuration
echo 8. Restore User Data
echo.
echo Management:
echo 9. List Backups
echo 10. Delete Backup
echo 11. Verify Backup
echo.
echo 12. Exit
echo.
set /p choice="Enter your choice (1-12): "

if "%choice%"=="1" goto full_backup
if "%choice%"=="2" goto db_backup
if "%choice%"=="3" goto config_backup
if "%choice%"=="4" goto user_backup
if "%choice%"=="5" goto full_restore
if "%choice%"=="6" goto db_restore
if "%choice%"=="7" goto config_restore
if "%choice%"=="8" goto user_restore
if "%choice%"=="9" goto list_backups
if "%choice%"=="10" goto delete_backup
if "%choice%"=="11" goto verify_backup
if "%choice%"=="12" goto end
goto menu

:full_backup
cls
echo Creating Full Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\full_backup_%timestamp%"

echo Creating backup directory: %backup_name%
mkdir %backup_name%

echo.
echo Backing up database...
call npm run db:backup > %backup_name%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database backup failed
    pause
    goto menu
)

echo.
echo Backing up configuration files...
xcopy /E /I /Y .env* %backup_name%\config\
xcopy /E /I /Y prisma %backup_name%\prisma\

echo.
echo Backing up user data...
xcopy /E /I /Y data %backup_name%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Full
echo Database: Included
echo Configuration: Included
echo User Data: Included
) > %backup_name%\manifest.txt

echo.
echo Full backup completed successfully!
echo Backup location: %backup_name%
echo Press any key to continue...
pause > nul
goto menu

:db_backup
cls
echo Creating Database Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\db_backup_%timestamp%"

echo Creating backup directory: %backup_name%
mkdir %backup_name%

echo.
echo Backing up database...
call npm run db:backup > %backup_name%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database backup failed
    pause
    goto menu
)

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Database
echo Database: Included
) > %backup_name%\manifest.txt

echo.
echo Database backup completed successfully!
echo Backup location: %backup_name%
echo Press any key to continue...
pause > nul
goto menu

:config_backup
cls
echo Creating Configuration Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\config_backup_%timestamp%"

echo Creating backup directory: %backup_name%
mkdir %backup_name%

echo.
echo Backing up configuration files...
xcopy /E /I /Y .env* %backup_name%\config\
xcopy /E /I /Y prisma %backup_name%\prisma\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Configuration
echo Configuration: Included
) > %backup_name%\manifest.txt

echo.
echo Configuration backup completed successfully!
echo Backup location: %backup_name%
echo Press any key to continue...
pause > nul
goto menu

:user_backup
cls
echo Creating User Data Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\user_backup_%timestamp%"

echo Creating backup directory: %backup_name%
mkdir %backup_name%

echo.
echo Backing up user data...
xcopy /E /I /Y data %backup_name%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: User Data
echo User Data: Included
) > %backup_name%\manifest.txt

echo.
echo User data backup completed successfully!
echo Backup location: %backup_name%
echo Press any key to continue...
pause > nul
goto menu

:full_restore
cls
echo Restoring Full Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to restore: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup...
if not exist %backup_dir%\%backup%\manifest.txt (
    echo [ERROR] Invalid backup: manifest not found
    pause
    goto menu
)

echo.
echo Restoring database...
call npm run db:restore < %backup_dir%\%backup%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database restore failed
    pause
    goto menu
)

echo.
echo Restoring configuration files...
xcopy /E /I /Y %backup_dir%\%backup%\config\* .
xcopy /E /I /Y %backup_dir%\%backup%\prisma\* prisma\

echo.
echo Restoring user data...
xcopy /E /I /Y %backup_dir%\%backup%\data\* data\

echo.
echo Full restore completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:db_restore
cls
echo Restoring Database...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to restore: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup...
if not exist %backup_dir%\%backup%\database.sql (
    echo [ERROR] Invalid backup: database file not found
    pause
    goto menu
)

echo.
echo Restoring database...
call npm run db:restore < %backup_dir%\%backup%\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database restore failed
    pause
    goto menu
)

echo.
echo Database restore completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:config_restore
cls
echo Restoring Configuration...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to restore: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup...
if not exist %backup_dir%\%backup%\config (
    echo [ERROR] Invalid backup: configuration files not found
    pause
    goto menu
)

echo.
echo Restoring configuration files...
xcopy /E /I /Y %backup_dir%\%backup%\config\* .
xcopy /E /I /Y %backup_dir%\%backup%\prisma\* prisma\

echo.
echo Configuration restore completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:user_restore
cls
echo Restoring User Data...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to restore: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup...
if not exist %backup_dir%\%backup%\data (
    echo [ERROR] Invalid backup: user data not found
    pause
    goto menu
)

echo.
echo Restoring user data...
xcopy /E /I /Y %backup_dir%\%backup%\data\* data\

echo.
echo User data restore completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:list_backups
cls
echo Listing Backups...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo No backups found.
) else (
    echo Available backups:
    echo.
    for /d %%i in (%backup_dir%\*) do (
        echo Backup: %%i
        if exist %%i\manifest.txt (
            type %%i\manifest.txt
            echo.
        )
    )
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:delete_backup
cls
echo Deleting Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to delete: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Are you sure you want to delete this backup? (Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    rmdir /s /q %backup_dir%\%backup%
    echo Backup deleted successfully!
) else (
    echo Operation cancelled.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:verify_backup
cls
echo Verifying Backup...
echo.
set "backup_dir=backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /B /AD %backup_dir%
echo.
set /p backup="Enter backup name to verify: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Verifying backup integrity...
if exist %backup_dir%\%backup%\manifest.txt (
    echo Manifest file found and valid
) else (
    echo [WARNING] Manifest file missing
)

if exist %backup_dir%\%backup%\database.sql (
    echo Database backup file found
) else (
    echo [WARNING] Database backup file missing
)

if exist %backup_dir%\%backup%\config (
    echo Configuration files found
) else (
    echo [WARNING] Configuration files missing
)

if exist %backup_dir%\%backup%\data (
    echo User data files found
) else (
    echo [WARNING] User data files missing
)

echo.
echo Backup verification completed!
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Backup & Restore Tools!
echo.
pause
exit /b 0 