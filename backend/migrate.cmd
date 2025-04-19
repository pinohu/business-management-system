@echo off
echo Running database migrations...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Generating Prisma client...
npx prisma generate

echo Running migrations...
npx prisma migrate dev

echo Migrations complete
pause
