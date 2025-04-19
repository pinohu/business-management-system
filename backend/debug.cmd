@echo off
echo Starting Business Management System Backend in debug mode...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Starting the debug server...
npm run start:debug

echo Debug server stopped
pause
