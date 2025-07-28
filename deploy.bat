@echo off
REM Taskio Production Deployment Script for Windows
REM This script builds and deploys the Taskio application

echo 🚀 Starting Taskio Production Deployment...

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Error: .env file not found!
    echo Please copy .env.production to .env and update with your production values
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed!
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed!
    exit /b 1
)

echo 📦 Installing backend dependencies...
npm ci --only=production
if errorlevel 1 exit /b 1

echo 🏗️  Building backend...
npm run prod:build
if errorlevel 1 exit /b 1

echo 📦 Installing frontend dependencies...
cd client
npm ci --only=production
if errorlevel 1 exit /b 1

echo 🏗️  Building frontend...
npm run build
if errorlevel 1 exit /b 1

echo 📁 Moving frontend build to backend...
cd ..
if exist "dist\public" rmdir /s /q "dist\public"
mkdir "dist\public"
xcopy "client\dist\*" "dist\public\" /s /e /y
if errorlevel 1 exit /b 1

echo 🗄️  Running database migrations...
npm run prod:migrate
if errorlevel 1 exit /b 1

echo ✅ Deployment completed successfully!
echo 🌟 You can now start the production server with: npm run prod:start
echo 🔗 Make sure your environment variables are properly configured
echo 🔧 Don't forget to configure your reverse proxy (nginx/apache) to serve static files

pause
