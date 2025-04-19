@echo off
echo Resetting database...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Dropping database...
npx prisma migrate reset --force

echo Database reset complete
pause
