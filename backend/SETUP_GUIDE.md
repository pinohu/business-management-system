# Setup Guide for Business Management System

## Prerequisites

1. **Node.js and npm**
   - Download and install Node.js from https://nodejs.org/
   - Choose the LTS version
   - Verify installation:
     ```cmd
     node --version
     npm --version
     ```

2. **PostgreSQL**
   - Download and install PostgreSQL from https://www.postgresql.org/download/windows/
   - During installation:
     - Note down the password you set for the postgres user
     - Keep the default port (5432)
     - Install all components
   - Verify installation:
     ```cmd
     psql --version
     ```

3. **Git**
   - Download and install Git from https://git-scm.com/downloads
   - Use default settings during installation
   - Verify installation:
     ```cmd
     git --version
     ```

## Setup Steps

1. **Open Command Prompt as Administrator**
   - Press Windows + X
   - Select "Windows Terminal (Admin)" or "Command Prompt (Admin)"

2. **Navigate to Project Directory**
   ```cmd
   cd "C:\Users\ohu00\Downloads\[TEST_DEPLOY-ULTIMATE PACKAGE]cursor_autonomous_project_template (1) - Copy\backend"
   ```

3. **Run Setup Script**
   ```cmd
   setup-open-source.cmd
   ```

4. **Verify Each Component**

   a. **Database Setup**
   - Check PostgreSQL service is running
   - Verify database and user creation
   - Test connection:
     ```cmd
     psql -U postgres -c "SELECT 1;"
     ```

   b. **Email Setup**
   - Check MailDev is running
   - Access MailDev interface at http://localhost:1080
   - Test email sending

   c. **Application Setup**
   - Check Node.js dependencies
   - Verify environment variables
   - Test application startup

5. **Troubleshooting**
   If any issues occur:
   ```cmd
   troubleshoot.cmd
   ```

## Post-Setup Verification

1. **Check Services**
   - PostgreSQL should be running
   - MailDev should be accessible
   - PM2 should be managing the application

2. **Test Endpoints**
   - Health check: http://localhost:3000/api/v1/health
   - API documentation: http://localhost:8080
   - MailDev interface: http://localhost:1080

3. **Verify Logs**
   - Check application logs in `logs/` directory
   - Check PM2 logs:
     ```cmd
     pm2 logs
     ```

## Common Issues and Solutions

1. **PostgreSQL Connection Issues**
   - Check if service is running
   - Verify password is correct
   - Check port 5432 is not blocked

2. **Node.js/npm Issues**
   - Clear npm cache:
     ```cmd
     npm cache clean --force
     ```
   - Reinstall dependencies:
     ```cmd
     npm install
     ```

3. **MailDev Issues**
   - Check if port 1025 is available
   - Restart MailDev:
     ```cmd
     maildev
     ```

4. **PM2 Issues**
   - Check process status:
     ```cmd
     pm2 list
     ```
   - Restart application:
     ```cmd
     pm2 restart all
     ```

## Maintenance

1. **Regular Updates**
   - Update dependencies:
     ```cmd
     npm update
     ```
   - Update database schema:
     ```cmd
     npx prisma migrate dev
     ```

2. **Backup**
   - Backup database regularly
   - Backup application logs
   - Backup uploaded files

3. **Monitoring**
   - Check PM2 dashboard: http://localhost:9615
   - Monitor application logs
   - Check MailDev for email issues
