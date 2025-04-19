@echo off
echo Freelance Dashboard Cleanup
echo =========================

:: Check if we're in the correct directory
if not exist package.json (
    echo Error: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Stop any running Node.js processes
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

:: Remove node_modules
if exist node_modules (
    echo Removing node_modules directory...
    rmdir /s /q node_modules
    if %errorlevel% neq 0 (
        echo Warning: Could not remove node_modules
        echo Please close any programs that might be using these files
        pause
        exit /b 1
    )
)

:: Remove package-lock.json
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
    if %errorlevel% neq 0 (
        echo Warning: Could not remove package-lock.json
        echo Please close any programs that might be using this file
        pause
        exit /b 1
    )
)

:: Remove .next directory
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    if %errorlevel% neq 0 (
        echo Warning: Could not remove .next directory
        echo Please close any programs that might be using these files
        pause
        exit /b 1
    )
)

:: Clean npm cache
echo Cleaning npm cache...
call npm cache clean --force
if %errorlevel% neq 0 (
    echo Warning: Could not clean npm cache
    echo Continuing anyway...
)

echo.
echo Cleanup completed successfully!
echo You can now run install.bat to start fresh.
echo.
pause 