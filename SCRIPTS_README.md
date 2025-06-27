# Board Game Tracker - Linux Scripts

This directory contains scripts to easily manage the Board Game Tracker application on Linux systems.

## Quick Start

```bash
# First time setup - install all dependencies
cd /root/projects/board_game_tracker && ./bgt install

# Start the application
cd /root/projects/board_game_tracker && ./bgt start

# Check status
cd /root/projects/board_game_tracker && ./bgt status

# Stop the application
cd /root/projects/board_game_tracker && ./bgt stop
```

## Available Scripts

### `bgt` - Main Management Script
The main command-line interface for managing the application.

```bash
cd /root/projects/board_game_tracker && ./bgt install   # Install all dependencies and set up the application
cd /root/projects/board_game_tracker && ./bgt start     # Start both backend and frontend servers
cd /root/projects/board_game_tracker && ./bgt stop      # Stop all servers
cd /root/projects/board_game_tracker && ./bgt restart   # Restart all servers
cd /root/projects/board_game_tracker && ./bgt status    # Show server status
cd /root/projects/board_game_tracker && ./bgt logs      # Show combined logs
cd /root/projects/board_game_tracker && ./bgt logs backend   # Show only backend logs
cd /root/projects/board_game_tracker && ./bgt logs frontend  # Show only frontend logs
```

### `start.sh` - Start Script
- Checks if ports are available
- Creates Python virtual environment if needed
- Installs dependencies
- Starts both servers in the background
- Shows real-time logs

### `stop.sh` - Stop Script
- Gracefully stops both servers
- Cleans up any running processes

## Prerequisites

Make sure you have these installed:
- Python 3.x with pip
- Node.js and npm
- lsof (usually pre-installed on most Linux distros)

## First Time Setup

1. Clone the repository
2. Copy `.env.example` to `.env` in the backend directory
3. Add your `ANTHROPIC_API_KEY` to the `.env` file
4. Run `cd /root/projects/board_game_tracker && ./bgt start`

The script will automatically:
- Create a Python virtual environment
- Install all Python dependencies
- Install all npm dependencies
- Start both servers

## Logs

Logs are written to:
- `backend.log` - Flask server logs
- `frontend.log` - React development server logs

## Systemd Service (Optional)

To run Board Game Tracker as a system service:

1. Edit `boardgametracker.service`:
   - Replace `YOUR_USERNAME` with your actual username
   - Replace `/path/to/board_game_tracker` with the actual path

2. Install the service:
   ```bash
   sudo cp boardgametracker.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable boardgametracker
   sudo systemctl start boardgametracker
   ```

3. Manage the service:
   ```bash
   sudo systemctl status boardgametracker
   sudo systemctl stop boardgametracker
   sudo systemctl restart boardgametracker
   ```

## Troubleshooting

### Port Already in Use
If you see "Port already in use" errors:
```bash
cd /root/projects/board_game_tracker && ./bgt stop  # This will kill any processes on ports 3000 and 5002
```

### Check What's Running
```bash
cd /root/projects/board_game_tracker && ./bgt status
```

### View Logs
```bash
# View all logs
cd /root/projects/board_game_tracker && ./bgt logs

# View specific logs
tail -f backend.log
tail -f frontend.log
```

### Manual Process Cleanup
If the scripts fail to stop the servers:
```bash
# Find and kill processes manually
lsof -ti:5002 | xargs kill -9  # Kill backend
lsof -ti:3000 | xargs kill -9  # Kill frontend
```

## Default Ports
- Backend API: http://localhost:5002
- Frontend UI: http://localhost:3000