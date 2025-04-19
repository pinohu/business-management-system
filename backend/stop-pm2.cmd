@echo off
echo Stopping Business Management System Backend...

echo Stopping PM2 process...
pm2 stop business-management-backend

echo Process stopped
pause
