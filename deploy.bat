@echo off
setlocal EnableDelayedExpansion

echo Freelance Dashboard Deployment
echo ============================

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
echo Freelance Dashboard Deployment
echo ============================
echo.
echo Build Options:
echo 1. Build for Development
echo 2. Build for Staging
echo 3. Build for Production
echo.
echo Deployment Options:
echo 4. Deploy to Local Server
echo 5. Deploy to Staging Server
echo 6. Deploy to Production Server
echo 7. Deploy to Docker Container
echo 8. Deploy to Kubernetes Cluster
echo.
echo Management:
echo 9. Create Deployment Package
echo 10. Rollback Deployment
echo 11. View Deployment History
echo 12. Clean Deployment Files
echo.
echo 13. Exit
echo.
set /p choice="Enter your choice (1-13): "

if "%choice%"=="1" goto build_dev
if "%choice%"=="2" goto build_staging
if "%choice%"=="3" goto build_prod
if "%choice%"=="4" goto deploy_local
if "%choice%"=="5" goto deploy_staging
if "%choice%"=="6" goto deploy_prod
if "%choice%"=="7" goto deploy_docker
if "%choice%"=="8" goto deploy_k8s
if "%choice%"=="9" goto create_package
if "%choice%"=="10" goto rollback
if "%choice%"=="11" goto view_history
if "%choice%"=="12" goto clean_deploy
if "%choice%"=="13" goto end
goto menu

:build_dev
cls
echo Building for Development...
echo.
echo Cleaning previous builds...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul

echo.
echo Installing dependencies...
call npm install

echo.
echo Building application...
call npm run build

echo.
echo Development build completed!
echo Press any key to continue...
pause > nul
goto menu

:build_staging
cls
echo Building for Staging...
echo.
echo Cleaning previous builds...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul

echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up staging environment...
copy .env.staging .env.local

echo.
echo Building application...
call npm run build

echo.
echo Staging build completed!
echo Press any key to continue...
pause > nul
goto menu

:build_prod
cls
echo Building for Production...
echo.
echo Cleaning previous builds...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul

echo.
echo Installing dependencies...
call npm install --production

echo.
echo Setting up production environment...
copy .env.production .env.local

echo.
echo Building application...
call npm run build

echo.
echo Production build completed!
echo Press any key to continue...
pause > nul
goto menu

:deploy_local
cls
echo Deploying to Local Server...
echo.
echo Checking if port 3000 is available...
netstat -ano | find ":3000" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Port 3000 is in use
    echo Please free up port 3000 or use a different port
    pause
    goto menu
)

echo.
echo Starting local server...
call npm run start

echo.
echo Local deployment completed!
echo Application is running at http://localhost:3000
echo Press any key to continue...
pause > nul
goto menu

:deploy_staging
cls
echo Deploying to Staging Server...
echo.
set "staging_dir=deployments\staging"
if not exist %staging_dir% mkdir %staging_dir%

echo.
echo Creating staging deployment package...
xcopy /E /I /Y .next %staging_dir%\.next\
xcopy /E /I /Y public %staging_dir%\public\
xcopy /E /I /Y node_modules %staging_dir%\node_modules\
xcopy /E /I /Y .env.staging %staging_dir%\.env\
copy package.json %staging_dir%\
copy package-lock.json %staging_dir%\

echo.
echo Deploying to staging server...
echo Please provide staging server details:
set /p staging_host="Enter staging server host: "
set /p staging_user="Enter staging server username: "
set /p staging_path="Enter deployment path: "

echo.
echo Copying files to staging server...
scp -r %staging_dir%\* %staging_user%@%staging_host%:%staging_path%

echo.
echo Staging deployment completed!
echo Press any key to continue...
pause > nul
goto menu

:deploy_prod
cls
echo Deploying to Production Server...
echo.
set "prod_dir=deployments\production"
if not exist %prod_dir% mkdir %prod_dir%

echo.
echo Creating production deployment package...
xcopy /E /I /Y .next %prod_dir%\.next\
xcopy /E /I /Y public %prod_dir%\public\
xcopy /E /I /Y node_modules %prod_dir%\node_modules\
xcopy /E /I /Y .env.production %prod_dir%\.env\
copy package.json %prod_dir%\
copy package-lock.json %prod_dir%\

echo.
echo Deploying to production server...
echo Please provide production server details:
set /p prod_host="Enter production server host: "
set /p prod_user="Enter production server username: "
set /p prod_path="Enter deployment path: "

echo.
echo Copying files to production server...
scp -r %prod_dir%\* %prod_user%@%prod_host%:%prod_path%

echo.
echo Production deployment completed!
echo Press any key to continue...
pause > nul
goto menu

:deploy_docker
cls
echo Deploying to Docker Container...
echo.
echo Building Docker image...
docker build -t freelance-dashboard .

echo.
echo Running Docker container...
docker run -d -p 3000:3000 --name freelance-dashboard freelance-dashboard

echo.
echo Docker deployment completed!
echo Container is running on port 3000
echo Press any key to continue...
pause > nul
goto menu

:deploy_k8s
cls
echo Deploying to Kubernetes Cluster...
echo.
echo Creating Kubernetes deployment...
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

echo.
echo Checking deployment status...
kubectl get deployments
kubectl get pods
kubectl get services

echo.
echo Kubernetes deployment completed!
echo Press any key to continue...
pause > nul
goto menu

:create_package
cls
echo Creating Deployment Package...
echo.
set "package_dir=deployments\packages"
if not exist %package_dir% mkdir %package_dir%

set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "package_name=%package_dir%\deploy_package_%timestamp%"

echo.
echo Creating deployment package...
mkdir %package_name%
xcopy /E /I /Y .next %package_name%\.next\
xcopy /E /I /Y public %package_name%\public\
xcopy /E /I /Y node_modules %package_name%\node_modules\
copy package.json %package_name%\
copy package-lock.json %package_name%\

echo.
echo Compressing package...
7z a -t7z %package_name%.7z %package_name%\*

echo.
echo Cleaning up...
rmdir /s /q %package_name%

echo.
echo Deployment package created successfully!
echo Package location: %package_name%.7z
echo Press any key to continue...
pause > nul
goto menu

:rollback
cls
echo Rolling Back Deployment...
echo.
set "deploy_dir=deployments"
if not exist %deploy_dir% (
    echo [ERROR] No deployments found
    pause
    goto menu
)

echo Available deployments:
dir /b %deploy_dir%\*
echo.
set /p deploy="Enter deployment to rollback: "

if not exist %deploy_dir%\%deploy% (
    echo [ERROR] Deployment not found
    pause
    goto menu
)

echo.
echo Are you sure you want to rollback this deployment? (Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    echo Rolling back deployment...
    xcopy /E /I /Y %deploy_dir%\%deploy%\* .
    echo Rollback completed successfully!
) else (
    echo Operation cancelled.
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:view_history
cls
echo Viewing Deployment History...
echo.
set "deploy_dir=deployments"
if not exist %deploy_dir% (
    echo No deployment history found
) else (
    echo Deployment History:
    echo.
    for /d %%d in (%deploy_dir%\*) do (
        echo Deployment: %%d
        if exist %%d\deploy_info.txt (
            type %%d\deploy_info.txt
            echo.
        )
    )
)
echo Press any key to continue...
pause > nul
goto menu

:clean_deploy
cls
echo Cleaning Deployment Files...
echo.
set "deploy_dir=deployments"
if not exist %deploy_dir% (
    echo No deployment files to clean
) else (
    echo Available deployment files:
    dir /b %deploy_dir%
    echo.
    echo Are you sure you want to clean deployment files? (Y/N)
    set /p confirm=
    if /i "%confirm%"=="Y" (
        rmdir /s /q %deploy_dir%
        echo Deployment files cleaned successfully!
    ) else (
        echo Operation cancelled.
    )
)
echo.
echo Press any key to continue...
pause > nul
goto menu

:end
echo.
echo Thank you for using Freelance Dashboard Deployment Tools!
echo.
pause
exit /b 0 