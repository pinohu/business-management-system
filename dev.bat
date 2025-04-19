@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Development Tools
echo ==================================

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
echo Freelance Dashboard Development Tools
echo ==================================
echo.
echo Development:
echo 1. Start Development Server
echo 2. Run Tests
echo 3. Lint Code
echo 4. Build for Production
echo 5. Check Dependencies
echo 6. Update Dependencies
echo 7. Clean Project
echo 8. Verify Installation
echo.
echo Code Quality:
echo 9. Run TypeScript Check
echo 10. Run Prettier Format
echo 11. Check Bundle Size
echo 12. Run Security Audit
echo.
echo Database:
echo 13. Run Database Migrations
echo 14. Seed Database
echo 15. Backup Database
echo.
echo Deployment:
echo 16. Open Deployment Tools
echo.
echo 17. Exit
echo.
set /p choice="Enter your choice (1-17): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto run_tests
if "%choice%"=="3" goto lint_code
if "%choice%"=="4" goto build_prod
if "%choice%"=="5" goto check_deps
if "%choice%"=="6" goto update_deps
if "%choice%"=="7" goto clean_proj
if "%choice%"=="8" goto verify_install
if "%choice%"=="9" goto type_check
if "%choice%"=="10" goto format_code
if "%choice%"=="11" goto check_bundle
if "%choice%"=="12" goto security_audit
if "%choice%"=="13" goto db_migrate
if "%choice%"=="14" goto db_seed
if "%choice%"=="15" goto db_backup
if "%choice%"=="16" goto deploy_menu
if "%choice%"=="17" goto end
goto menu

:start_dev
cls
echo Starting Development Server...
call :check_port 3000
if %errorlevel% neq 0 goto menu
echo.
echo Starting the development server...
echo Press Ctrl+C to stop the server
echo.
call npm run dev
goto menu

:run_tests
cls
echo Running Tests...
echo.
call npm test
echo.
echo Press any key to continue...
pause > nul
goto menu

:lint_code
cls
echo Running ESLint...
echo.
call npm run lint
echo.
echo Press any key to continue...
pause > nul
goto menu

:build_prod
cls
echo Building for Production...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    echo Please check the error messages above
    pause
    goto menu
)
echo.
echo Build completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:check_deps
cls
echo Checking Dependencies...
echo.
call npm audit
echo.
echo Press any key to continue...
pause > nul
goto menu

:update_deps
cls
echo Updating Dependencies...
echo.
call npm update
echo.
echo Press any key to continue...
pause > nul
goto menu

:clean_proj
cls
echo Cleaning Project...
echo.
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
echo.
echo Project cleaned successfully!
echo Press any key to continue...
pause > nul
goto menu

:verify_install
cls
echo Verifying Installation...
echo.
call verify.bat
echo.
echo Press any key to continue...
pause > nul
goto menu

:type_check
cls
echo Running TypeScript Check...
echo.
call npm run type-check
echo.
echo Press any key to continue...
pause > nul
goto menu

:format_code
cls
echo Running Prettier Format...
echo.
call npm run format
echo.
echo Press any key to continue...
pause > nul
goto menu

:check_bundle
cls
echo Checking Bundle Size...
echo.
call npm run analyze
echo.
echo Press any key to continue...
pause > nul
goto menu

:security_audit
cls
echo Running Security Audit...
echo.
call npm audit
echo.
echo Running Snyk Security Check...
call npx snyk test
echo.
echo Press any key to continue...
pause > nul
goto menu

:db_migrate
cls
echo Running Database Migrations...
echo.
call npm run migrate
echo.
echo Press any key to continue...
pause > nul
goto menu

:db_seed
cls
echo Seeding Database...
echo.
call npm run seed
echo.
echo Press any key to continue...
pause > nul
goto menu

:db_backup
cls
echo Backing Up Database...
echo.
set "backup_dir=db_backups"
if not exist %backup_dir% mkdir %backup_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_file=%backup_dir%\backup_%timestamp%.sql"

echo Creating backup: %backup_file%
call npm run db:backup > %backup_file%
if %errorlevel% neq 0 (
    echo [ERROR] Database backup failed
    echo Please check the error messages above
    pause
    goto menu
)
echo.
echo Database backup completed successfully!
echo Press any key to continue...
pause > nul
goto menu

:deploy_menu
cls
echo Opening Deployment Tools...
echo.
call deploy.bat
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Development Tools!
echo.
pause
exit /b 0 