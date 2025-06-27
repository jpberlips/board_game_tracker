#!/bin/bash

# Board Game Tracker Stop Script
# This script stops both the backend Flask server and frontend React server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}Stopping Board Game Tracker...${NC}"

# Function to stop process on port
stop_port() {
    local port=$1
    local name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "Stopping $name on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ $name stopped${NC}"
    else
        echo "$name not running on port $port"
    fi
}

# Stop backend server
stop_port 5002 "Backend server"

# Stop frontend server
stop_port 3000 "Frontend server"

echo -e "\n${GREEN}Board Game Tracker stopped successfully!${NC}"