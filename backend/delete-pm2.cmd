@echo off
echo Deleting Business Management System Backend...

echo Deleting PM2 process...
pm2 delete business-management-backend

echo Process deleted
pause
