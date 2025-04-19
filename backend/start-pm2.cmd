@echo off
echo Starting Business Management System Backend with PM2...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Starting the application with PM2...
pm2 start dist/main.js --name "business-management-backend"

echo Application started with PM2
pause
