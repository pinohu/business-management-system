@echo off
echo Starting Business Management System Backend in development mode...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Starting the development server...
npm run start:dev

echo Development server stopped
pause
