@echo off
echo Starting Crypto MLM Platform...
echo.

echo [1/3] Starting MongoDB...
start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\Users\homeb\AppData\Local\MongoDB\data"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API...
start "Backend API" cmd /k "cd /d c:\Users\homeb\Documents\trae_projects\crypto-mlm-platform\server && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd /d c:\Users\homeb\Documents\trae_projects\crypto-mlm-platform\client && node serve.js"

echo.
echo ========================================
echo  Crypto MLM Platform Started!
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:3040
echo  MongoDB:  Port 27017
echo ========================================
echo.
echo Demo Credentials:
echo Email: admin@demo.com
echo Password: 123456
echo ========================================
pause
