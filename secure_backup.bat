@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Secure Backup
echo ===============================

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
echo Freelance Dashboard Secure Backup
echo ===============================
echo.
echo Backup Options:
echo 1. Create Encrypted Backup
echo 2. Create Compressed Backup
echo 3. Create Encrypted & Compressed Backup
echo 4. Restore from Backup
echo.
echo Management:
echo 5. List Backups
echo 6. Delete Backup
echo 7. Verify Backup
echo 8. Export Backup Key
echo.
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto encrypted_backup
if "%choice%"=="2" goto compressed_backup
if "%choice%"=="3" goto secure_backup
if "%choice%"=="4" goto restore_backup
if "%choice%"=="5" goto list_backups
if "%choice%"=="6" goto delete_backup
if "%choice%"=="7" goto verify_backup
if "%choice%"=="8" goto export_key
if "%choice%"=="9" goto end
goto menu

:encrypted_backup
cls
echo Creating Encrypted Backup...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\encrypted_backup_%timestamp%"
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
echo Backing up configuration files...
xcopy /E /I /Y .env* %temp_dir%\config\
xcopy /E /I /Y prisma %temp_dir%\prisma\

echo.
echo Backing up user data...
xcopy /E /I /Y data %temp_dir%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Encrypted
echo Database: Included
echo Configuration: Included
echo User Data: Included
) > %temp_dir%\manifest.txt

echo.
echo Generating encryption key...
set "key_file=%backup_dir%\keys\key_%timestamp%.key"
if not exist %backup_dir%\keys mkdir %backup_dir%\keys
openssl rand -base64 32 > %key_file%

echo.
echo Encrypting backup...
7z a -t7z -p%key_file% %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Encrypted backup created successfully!
echo Backup location: %backup_name%.7z
echo Key location: %key_file%
echo Press any key to continue...
pause > nul
goto menu

:compressed_backup
cls
echo Creating Compressed Backup...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\compressed_backup_%timestamp%"
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
echo Backing up configuration files...
xcopy /E /I /Y .env* %temp_dir%\config\
xcopy /E /I /Y prisma %temp_dir%\prisma\

echo.
echo Backing up user data...
xcopy /E /I /Y data %temp_dir%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Compressed
echo Database: Included
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
echo Compressed backup created successfully!
echo Backup location: %backup_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:secure_backup
cls
echo Creating Encrypted & Compressed Backup...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=%backup_dir%\secure_backup_%timestamp%"
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
echo Backing up configuration files...
xcopy /E /I /Y .env* %temp_dir%\config\
xcopy /E /I /Y prisma %temp_dir%\prisma\

echo.
echo Backing up user data...
xcopy /E /I /Y data %temp_dir%\data\

echo.
echo Creating backup manifest...
(
echo Backup Date: %date% %time%
echo Backup Type: Encrypted and Compressed
echo Database: Included
echo Configuration: Included
echo User Data: Included
) > %temp_dir%\manifest.txt

echo.
echo Generating encryption key...
set "key_file=%backup_dir%\keys\key_%timestamp%.key"
if not exist %backup_dir%\keys mkdir %backup_dir%\keys
openssl rand -base64 32 > %key_file%

echo.
echo Creating encrypted and compressed backup...
7z a -t7z -mx9 -p%key_file% %backup_name%.7z %temp_dir%\*

echo.
echo Cleaning up temporary files...
rmdir /s /q %temp_dir%

echo.
echo Secure backup created successfully!
echo Backup location: %backup_name%.7z
echo Key location: %key_file%
echo Press any key to continue...
pause > nul
goto menu

:restore_backup
cls
echo Restoring from Backup...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /b %backup_dir%\*.7z
echo.
set /p backup="Enter backup file name: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Checking if backup is encrypted...
7z l %backup_dir%\%backup% | find "Encrypted" >nul
if %errorlevel% equ 0 (
    echo Backup is encrypted. Please provide the key file.
    set /p key_file="Enter key file path: "
    if not exist %key_file% (
        echo [ERROR] Key file not found
        pause
        goto menu
    )
    echo.
    echo Extracting backup...
    7z x -p%key_file% %backup_dir%\%backup% -o%backup_dir%\temp
) else (
    echo.
    echo Extracting backup...
    7z x %backup_dir%\%backup% -o%backup_dir%\temp
)

if %errorlevel% neq 0 (
    echo [ERROR] Failed to extract backup
    pause
    goto menu
)

echo.
echo Verifying backup...
if not exist %backup_dir%\temp\manifest.txt (
    echo [ERROR] Invalid backup: manifest not found
    rmdir /s /q %backup_dir%\temp
    pause
    goto menu
)

echo.
echo Restoring database...
call npm run db:restore < %backup_dir%\temp\database.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database restore failed
    rmdir /s /q %backup_dir%\temp
    pause
    goto menu
)

echo.
echo Restoring configuration files...
xcopy /E /I /Y %backup_dir%\temp\config\* .
xcopy /E /I /Y %backup_dir%\temp\prisma\* prisma\

echo.
echo Restoring user data...
xcopy /E /I /Y %backup_dir%\temp\data\* data\

echo.
echo Cleaning up temporary files...
rmdir /s /q %backup_dir%\temp

echo.
echo Backup restored successfully!
echo Press any key to continue...
pause > nul
goto menu

:list_backups
cls
echo Listing Backups...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% (
    echo No backups found.
) else (
    echo Available backups:
    echo.
    for %%f in (%backup_dir%\*.7z) do (
        echo Backup: %%f
        7z l %%f | find "Size"
        echo.
    )
)
echo Press any key to continue...
pause > nul
goto menu

:delete_backup
cls
echo Deleting Backup...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /b %backup_dir%\*.7z
echo.
set /p backup="Enter backup file name to delete: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Are you sure you want to delete this backup? (Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    del %backup_dir%\%backup%
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
set "backup_dir=secure_backups"
if not exist %backup_dir% (
    echo [ERROR] No backups found
    pause
    goto menu
)

echo Available backups:
dir /b %backup_dir%\*.7z
echo.
set /p backup="Enter backup file name to verify: "

if not exist %backup_dir%\%backup% (
    echo [ERROR] Backup not found
    pause
    goto menu
)

echo.
echo Checking backup integrity...
7z t %backup_dir%\%backup%
if %errorlevel% neq 0 (
    echo [ERROR] Backup verification failed
) else (
    echo Backup verification successful!
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:export_key
cls
echo Exporting Backup Key...
echo.
set "backup_dir=secure_backups"
if not exist %backup_dir%\keys (
    echo [ERROR] No keys found
    pause
    goto menu
)

echo Available keys:
dir /b %backup_dir%\keys\*.key
echo.
set /p key="Enter key file name to export: "

if not exist %backup_dir%\keys\%key% (
    echo [ERROR] Key not found
    pause
    goto menu
)

echo.
echo Exporting key to backup directory...
copy %backup_dir%\keys\%key% %backup_dir%\exported_%key%
echo Key exported successfully!
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Secure Backup!
echo.
pause
exit /b 0 