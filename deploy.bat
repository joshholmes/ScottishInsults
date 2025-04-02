@echo off
echo Scottish Insults Generator Deployment Script
echo ==========================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Detected Node.js version: %NODE_VERSION%

REM Install dependencies
echo Installing dependencies...
call npm install

REM Create iisnode directory if it doesn't exist
if not exist "iisnode" mkdir iisnode

REM Set permissions
echo Setting permissions...
icacls . /grant "IIS_IUSRS:(OI)(CI)(RX)" /T
icacls . /grant "IIS AppPool\ScottishInsults:(OI)(CI)(F)" /T

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo PORT=3000 > .env
    echo NODE_ENV=production >> .env
)

echo Deployment completed successfully!
echo Please restart the IIS application pool and website.
pause 