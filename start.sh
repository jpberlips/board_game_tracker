#!/bin/bash

# Board Game Tracker Startup Script
# This script starts both the backend Flask server and frontend React server

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Board Game Tracker - Starting Up     ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}Shutting down Board Game Tracker...${NC}"
    
    # Kill backend process
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Check if backend port is already in use
if check_port 5002; then
    echo -e "${RED}Error: Port 5002 is already in use!${NC}"
    echo "Please stop the existing backend server first."
    exit 1
fi

# Check if frontend port is already in use
if check_port 3000; then
    echo -e "${RED}Error: Port 3000 is already in use!${NC}"
    echo "Please stop the existing frontend server first."
    exit 1
fi

# Start Backend Server
echo -e "\n${GREEN}Starting Backend Server...${NC}"
cd backend

# Create instance directory for database if it doesn't exist
if [ ! -d "instance" ]; then
    echo "Creating instance directory for database..."
    mkdir -p instance
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install requirements
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt -q

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Warning: .env file not found in backend directory!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${RED}Please edit backend/.env and add your ANTHROPIC_API_KEY${NC}"
fi

# Run database migrations
echo "Checking for database migrations..."
python migrate.py migrate

# Start Flask server in background
echo "Starting Flask server on port 5002..."
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start Frontend Server
echo -e "\n${GREEN}Starting Frontend Server...${NC}"
cd frontend

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start React server in background
echo "Starting React server on port 3000..."
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
echo -e "\n${BLUE}Waiting for servers to start...${NC}"
sleep 5

# Check if servers are running
if check_port 5002 && check_port 3000; then
    echo -e "\n${GREEN}✓ Board Game Tracker is running!${NC}"
    echo -e "${GREEN}✓ Backend API: http://localhost:5002${NC}"
    echo -e "${GREEN}✓ Frontend UI: http://localhost:3000${NC}"
    echo -e "\n${BLUE}Logs are being written to:${NC}"
    echo "  - backend.log"
    echo "  - frontend.log"
    echo -e "\n${BLUE}Press Ctrl+C to stop all servers${NC}"
    
    # Keep script running and show logs
    tail -f backend.log frontend.log
else
    echo -e "\n${RED}Error: Failed to start servers!${NC}"
    echo "Check the log files for errors:"
    echo "  - backend.log"
    echo "  - frontend.log"
    exit 1
fi