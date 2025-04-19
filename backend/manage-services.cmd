@echo off
echo Managing Open Source Services
echo ===========================
echo.
echo 1. Start all services
echo 2. Stop all services
echo 3. Restart all services
echo 4. Check service status
echo 5. View MailDev interface
echo 6. View application logs
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Starting all services...
    start /B maildev
    echo Services started!
    pause
    goto :eof
)

if "%choice%"=="2" (
    echo Stopping all services...
    taskkill /F /IM maildev.exe >nul 2>nul
    echo Services stopped!
    pause
    goto :eof
)

if "%choice%"=="3" (
    echo Restarting all services...
    taskkill /F /IM maildev.exe >nul 2>nul
    start /B maildev
    echo Services restarted!
    pause
    goto :eof
)

if "%choice%"=="4" (
    echo Checking service status...
    echo.
    echo PostgreSQL:
    where postgres >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo - Running
    ) else (
        echo - Not installed
    )
    echo.
    echo MailDev:
    tasklist | find "maildev" >nul
    if %ERRORLEVEL% equ 0 (
        echo - Running
    ) else (
        echo - Stopped
    )
    echo.
    echo Application:
    netstat -ano | find ":3000" >nul
    if %ERRORLEVEL% equ 0 (
        echo - Running
    ) else (
        echo - Stopped
    )
    pause
    goto :eof
)

if "%choice%"=="5" (
    echo Opening MailDev interface...
    start http://localhost:1080
    goto :eof
)

if "%choice%"=="6" (
    echo Opening application logs...
    if exist logs\app.log (
        type logs\app.log | more
    ) else (
        echo No log file found.
    )
    pause
    goto :eof
)

if "%choice%"=="7" (
    exit /b 0
)

echo Invalid choice. Please try again.
pause
goto :eof
