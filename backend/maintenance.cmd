@echo off
echo Maintenance Tasks
echo ================

:: Check for updates
echo Checking for updates...
call npm outdated
if %ERRORLEVEL% equ 0 (
    echo.
    set /p update="Updates available. Do you want to update? (y/n): "
    if /i "%update%"=="y" (
        echo Updating dependencies...
        call npm update
        if %ERRORLEVEL% neq 0 (
            echo Failed to update dependencies
            pause
            exit /b 1
        )
    )
)

:: Check database
echo.
echo Checking database...
call npx prisma migrate status
if %ERRORLEVEL% neq 0 (
    echo Database check failed
    pause
    exit /b 1
)

:: Backup database
echo.
echo Creating database backup...
set "BACKUP_DIR=backups"
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
set "BACKUP_FILE=%BACKUP_DIR%\backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%.sql"
pg_dump -U postgres business_management > "%BACKUP_FILE%"
if %ERRORLEVEL% equ 0 (
    echo Backup created: %BACKUP_FILE%
) else (
    echo Backup failed
    pause
    exit /b 1
)

:: Clean up old backups
echo.
echo Cleaning up old backups...
forfiles /P %BACKUP_DIR% /M *.sql /D -7 /C "cmd /c del @path"
if %ERRORLEVEL% equ 0 (
    echo Cleanup complete
) else (
    echo Cleanup failed
)

:: Check logs
echo.
echo Checking logs...
if exist logs\err.log (
    echo Error log size:
    for %%A in (logs\err.log) do echo %%~zA bytes
)
if exist logs\out.log (
    echo Output log size:
    for %%A in (logs\out.log) do echo %%~zA bytes
)

:: Rotate logs if needed
echo.
echo Rotating logs...
call pm2 flush
if %ERRORLEVEL% equ 0 (
    echo Logs rotated
) else (
    echo Log rotation failed
)

:: Check disk space
echo.
echo Checking disk space...
for /f "tokens=3" %%a in ('dir /-c . ^| find "bytes free"') do set free=%%a
echo Free space: %free% bytes

:: Check memory usage
echo.
echo Checking memory usage...
pm2 list
if %ERRORLEVEL% equ 0 (
    echo Memory check complete
) else (
    echo Memory check failed
)

echo.
echo Maintenance tasks completed!
echo.
echo Next steps:
echo 1. Review the backup at %BACKUP_DIR%
echo 2. Check the PM2 dashboard at http://localhost:9615
echo 3. Monitor the application logs
echo.
pause
