#!/bin/bash

# Board Game Tracker Background Startup Script
# This script starts both servers in the background

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

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
echo -e "${GREEN}Starting Backend Server in background...${NC}"
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

# Start Flask server in background
echo "Starting Flask server on port 5002..."
nohup python app.py > ../backend.log 2>&1 &
cd ..

# Start Frontend Server
echo -e "${GREEN}Starting Frontend Server in background...${NC}"
cd frontend

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start React server in background
echo "Starting React server on port 3000..."
BROWSER=none nohup npm start > ../frontend.log 2>&1 &
cd ..

echo -e "${GREEN}✓ Servers started in background${NC}"