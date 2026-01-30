@echo off
REM CropGuard AI - Quick Start Script for Windows
REM This script starts all required services

echo.
echo ============================================
echo CropGuard AI - System Startup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
cd backend
pip list | findstr "django tensorflow flask" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
)
cd ..

echo [OK] Dependencies verified
echo.

echo ============================================
echo Starting CropGuard AI Services
echo ============================================
echo.

REM Start Django Server
echo [2/3] Starting Django REST API (Port 8000)...
echo.
start cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Start Flask ML Service
echo [3/3] Starting Flask ML Service (Port 5000)...
echo.
start cmd /k "cd backend && python app.py"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Start Frontend Server
echo [4/4] Starting Frontend Server (Port 8001)...
echo.
start cmd /k "cd frontend && python -m http.server 8001"

echo.
echo ============================================
echo All Services Started!
echo ============================================
echo.
echo Services Running:
echo   - Django API:  http://127.0.0.1:8000
echo   - Flask ML:    http://127.0.0.1:5000
echo   - Frontend:    http://127.0.0.1:8001
echo.
echo Open http://127.0.0.1:8001 in your browser
echo.
pause
