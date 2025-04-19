@echo off
echo Starting project setup...

echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Running database migrations...
call npx prisma migrate dev

echo Building the project...
call npm run build

echo Setup complete!
pause
