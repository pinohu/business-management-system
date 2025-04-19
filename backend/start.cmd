@echo off
echo Starting Business Management System Backend...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Starting the application...
node dist/main

echo Application stopped
pause
