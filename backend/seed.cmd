@echo off
echo Seeding database...

echo Loading environment variables...
if exist .env (
  echo Using .env file
) else (
  echo .env file not found, using default environment
)

echo Running seed script...
npx prisma db seed

echo Database seeding complete
pause
