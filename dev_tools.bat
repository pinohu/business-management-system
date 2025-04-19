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

:: Main menu
:menu
cls
echo Freelance Dashboard Development Tools
echo ==================================
echo.
echo Code Quality:
echo 1. Run TypeScript Check
echo 2. Run ESLint
echo 3. Format Code
echo 4. Run Tests
echo.
echo Database:
echo 5. Run Migrations
echo 6. Seed Database
echo 7. Reset Database
echo 8. Generate Prisma Client
echo.
echo Development:
echo 9. Start Development Server
echo 10. Build Application
echo 11. Analyze Bundle Size
echo 12. Generate API Documentation
echo.
echo Utilities:
echo 13. Clean Project
echo 14. Update Dependencies
echo 15. Check Security Vulnerabilities
echo 16. Generate Component Documentation
echo.
echo 17. Exit
echo.
set /p choice="Enter your choice (1-17): "

if "%choice%"=="1" goto type_check
if "%choice%"=="2" goto run_lint
if "%choice%"=="3" goto format_code
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto run_migrations
if "%choice%"=="6" goto seed_db
if "%choice%"=="7" goto reset_db
if "%choice%"=="8" goto gen_prisma
if "%choice%"=="9" goto start_dev
if "%choice%"=="10" goto build_app
if "%choice%"=="11" goto analyze_bundle
if "%choice%"=="12" goto gen_api_docs
if "%choice%"=="13" goto clean_project
if "%choice%"=="14" goto update_deps
if "%choice%"=="15" goto check_security
if "%choice%"=="16" goto gen_component_docs
if "%choice%"=="17" goto end
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

:run_lint
cls
echo Running ESLint...
echo.
call npm run lint
echo.
echo Press any key to continue...
pause > nul
goto menu

:format_code
cls
echo Formatting Code...
echo.
call npm run format
echo.
echo Press any key to continue...
pause > nul
goto menu

:run_tests
cls
echo Running Tests...
echo.
call npm run test
echo.
echo Press any key to continue...
pause > nul
goto menu

:run_migrations
cls
echo Running Database Migrations...
echo.
call npm run migrate
echo.
echo Press any key to continue...
pause > nul
goto menu

:seed_db
cls
echo Seeding Database...
echo.
call npm run seed
echo.
echo Press any key to continue...
pause > nul
goto menu

:reset_db
cls
echo Resetting Database...
echo.
echo Are you sure you want to reset the database? This will delete all data. (Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    echo Resetting database...
    call npm run db:reset
    echo Database reset completed!
) else (
    echo Operation cancelled.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:gen_prisma
cls
echo Generating Prisma Client...
echo.
call npm run prisma:generate
echo.
echo Press any key to continue...
pause > nul
goto menu

:start_dev
cls
echo Starting Development Server...
echo.
call npm run dev
echo.
echo Press any key to continue...
pause > nul
goto menu

:build_app
cls
echo Building Application...
echo.
call npm run build
echo.
echo Press any key to continue...
pause > nul
goto menu

:analyze_bundle
cls
echo Analyzing Bundle Size...
echo.
call npm run analyze
echo.
echo Press any key to continue...
pause > nul
goto menu

:gen_api_docs
cls
echo Generating API Documentation...
echo.
call npm run docs:api
echo.
echo Press any key to continue...
pause > nul
goto menu

:clean_project
cls
echo Cleaning Project...
echo.
echo Cleaning build files...
rmdir /s /q .next 2>nul
rmdir /s /q dist 2>nul
rmdir /s /q coverage 2>nul

echo.
echo Cleaning dependencies...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo Cleaning cache...
call npm cache clean --force

echo.
echo Project cleaned successfully!
echo Press any key to continue...
pause > nul
goto menu

:update_deps
cls
echo Updating Dependencies...
echo.
echo Checking for outdated packages...
call npm outdated

echo.
echo Updating packages...
call npm update

echo.
echo Press any key to continue...
pause > nul
goto menu

:check_security
cls
echo Checking Security Vulnerabilities...
echo.
echo Running security audit...
call npm audit

echo.
echo Running dependency check...
call npm audit fix

echo.
echo Press any key to continue...
pause > nul
goto menu

:gen_component_docs
cls
echo Generating Component Documentation...
echo.
echo Creating component documentation...
call npm run docs:components

echo.
echo Documentation generated successfully!
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Development Tools!
echo.
pause
exit /b 0 