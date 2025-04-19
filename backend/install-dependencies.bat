@echo off
echo Installing NestJS dependencies...
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/mapped-types

echo Installing authentication dependencies...
npm install passport passport-jwt passport-local bcrypt

echo Installing type definitions...
npm install @types/passport-jwt @types/passport-local @types/bcrypt

echo Installing validation dependencies...
npm install class-validator class-transformer

echo Installing database dependencies...
npm install @prisma/client

echo Installing PDF generation...
npm install pdf-lib

echo Installing development dependencies...
npm install --save-dev @types/node typescript ts-node @nestjs/cli @nestjs/schematics @nestjs/testing

echo Installation complete!
pause
