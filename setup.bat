@echo off
echo Setting up the project...

:: Navigate to the project directory
cd /d "%~dp0"

:: Clean npm cache
echo Cleaning npm cache...
call npm cache clean --force

:: Remove existing node_modules and package-lock.json if they exist
if exist node_modules (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing existing package-lock.json...
    del package-lock.json
)

:: Install dependencies one by one
echo Installing dependencies...

:: Core dependencies
echo Installing core dependencies...
call npm install next@latest react@latest react-dom@latest --save
if errorlevel 1 goto error

:: Material-UI dependencies
echo Installing Material-UI dependencies...
call npm install @mui/material@latest @emotion/react@latest @emotion/styled@latest @mui/icons-material@latest --save
if errorlevel 1 goto error

:: Authentication dependencies
echo Installing authentication dependencies...
call npm install jsonwebtoken@latest cookie@latest --save
if errorlevel 1 goto error

:: Chart dependencies
echo Installing chart dependencies...
call npm install recharts@latest --save
if errorlevel 1 goto error

:: Development dependencies
echo Installing development dependencies...
call npm install eslint@latest eslint-config-next@latest --save-dev
if errorlevel 1 goto error

:: Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    echo JWT_SECRET=your-super-secret-key-change-this-in-production > .env.local
    echo NODE_ENV=development >> .env.local
)

echo.
echo Setup completed successfully!
echo.
echo You can now run the following commands:
echo npm run dev    - Start the development server
echo npm run build  - Build for production
echo npm run start  - Start the production server
echo.
goto end

:error
echo.
echo An error occurred during installation.
echo Please check the error message above and try again.
echo.
pause
exit /b 1

:end
echo.
echo Press any key to exit...
pause > nul
