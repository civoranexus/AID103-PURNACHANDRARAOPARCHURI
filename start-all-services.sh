#!/bin/bash

# CropGuard AI - Quick Start Script for macOS/Linux
# This script starts all required services

echo ""
echo "============================================"
echo "CropGuard AI - System Startup"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi

echo "[1/4] Checking Python version..."
python3 --version

echo "[2/4] Checking dependencies..."
cd backend || exit 1
if ! python3 -c "import django, tensorflow, flask" 2>/dev/null; then
    echo "Installing required packages..."
    pip3 install -r requirements.txt
fi
cd .. || exit 1

echo "[OK] Dependencies verified"
echo ""

echo "============================================"
echo "Starting CropGuard AI Services"
echo "============================================"
echo ""

# Create a function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $DJANGO_PID 2>/dev/null
    kill $FLASK_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Django Server
echo "[1/4] Starting Django REST API (Port 8000)..."
cd backend || exit 1
python3 manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!
cd .. || exit 1
sleep 2

# Start Flask ML Service
echo "[2/4] Starting Flask ML Service (Port 5000)..."
cd backend || exit 1
python3 app.py &
FLASK_PID=$!
cd .. || exit 1
sleep 2

# Start Frontend Server
echo "[3/4] Starting Frontend Server (Port 8001)..."
cd frontend || exit 1
python3 -m http.server 8001 &
FRONTEND_PID=$!
cd .. || exit 1
sleep 2

echo ""
echo "============================================"
echo "All Services Started!"
echo "============================================"
echo ""
echo "Services Running:"
echo "  - Django API:  http://127.0.0.1:8000"
echo "  - Flask ML:    http://127.0.0.1:5000"
echo "  - Frontend:    http://127.0.0.1:8001"
echo ""
echo "Open http://127.0.0.1:8001 in your browser"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for any service to exit
wait
