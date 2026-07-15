@echo off
echo ===================================================
echo               Starting GitPulse Analytics
echo ===================================================
echo.

echo [1/2] Starting Express Backend Server...
start "GitPulse Backend" cmd /k "cd /d e:\Github analyzer\gitpulse-backend && npm run dev"

echo [2/2] Starting Vite Frontend Server...
start "GitPulse Frontend" cmd /k "cd /d e:\Github analyzer\gitpulse-frontend && npm run dev"

echo.
echo ===================================================
echo  Both servers are starting in separate windows.
echo  - Backend runs at: http://localhost:5000
echo  - Frontend runs at: http://localhost:5173
echo ===================================================
echo.
pause
