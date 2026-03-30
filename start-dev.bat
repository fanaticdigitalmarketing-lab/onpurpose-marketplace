@echo off
echo 🚀 Starting OnPurpose Development Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org
    start https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file
if not exist .env (
    copy .env.development .env
    echo ✅ Environment file created
)

REM Start the server
echo 🚀 Starting OnPurpose API server...
npm start
