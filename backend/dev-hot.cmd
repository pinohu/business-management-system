@echo off
echo Starting Business Management System Backend in development mode with hot reload...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Starting the development server with hot reload...
npm run start:dev -- --watch

echo Development server stopped
pause
