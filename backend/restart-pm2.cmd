@echo off
echo Restarting Business Management System Backend...

echo Restarting PM2 process...
pm2 restart business-management-backend

echo Process restarted
pause
