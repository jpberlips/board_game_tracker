# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Game Tracker is a full-stack web application for tracking board game collections and game sessions. It features BGG (BoardGameGeek) integration for auto-fetching game details and Claude AI integration for game suggestions.

## Documentation Maintenance

**IMPORTANT**: When updating project documentation, ensure consistency across all documentation files:

- **README.md**: Main project documentation for users and contributors
- **SCRIPTS_README.md**: Detailed documentation for the BGT management script and deployment
- **CLAUDE.md**: This file - development guidelines for Claude Code

Always review and update all three files when making changes to:
- Installation procedures
- Command examples  
- Server management instructions
- Project paths or structure
- Feature descriptions

Keep command examples, paths, and procedures synchronized across all documentation files.

## Development Commands

**IMPORTANT**: Always use absolute paths when using `cd` commands to avoid confusion and ensure you're in the correct directory.

### Project Paths
- **Project Root**: `/root/projects/board_game_tracker/`
- **Backend**: `/root/projects/board_game_tracker/backend/`
- **Frontend**: `/root/projects/board_game_tracker/frontend/`

### Using the BGT Management Script (Recommended)

The project includes a comprehensive management script for easy server control:

```bash
# Install all dependencies (first time setup)
cd /root/projects/board_game_tracker && ./bgt install

# Start both servers (shows logs in foreground - blocks terminal)
cd /root/projects/board_game_tracker && ./bgt start

# Start both servers in background (recommended for development)
cd /root/projects/board_game_tracker && ./bgt start-bg

# Check server status
cd /root/projects/board_game_tracker && ./bgt status

# Stop all servers
cd /root/projects/board_game_tracker && ./bgt stop

# Restart all servers (useful after code changes)
cd /root/projects/board_game_tracker && ./bgt restart

# View logs
cd /root/projects/board_game_tracker && ./bgt logs           # Combined logs
cd /root/projects/board_game_tracker && ./bgt logs backend   # Backend only
cd /root/projects/board_game_tracker && ./bgt logs frontend  # Frontend only
```

### Manual Server Management (Alternative)

If you need to manage servers manually:

```bash
# Backend
cd /root/projects/board_game_tracker/backend
pip3 install -r requirements.txt                    # Install dependencies
nohup python3 app.py > app.log 2>&1 &              # Run Flask server in background (port 5002)

# Frontend
cd /root/projects/board_game_tracker/frontend
npm install                                         # Install dependencies
nohup npm start > frontend.log 2>&1 &              # Run React dev server in background (port 3000)
npm run build                                       # Build for production
```

**IMPORTANT**: Always use the `./bgt` script for server management as it handles background execution, dependency installation, and proper cleanup automatically. See `SCRIPTS_README.md` for detailed documentation.

## Architecture

### Backend Structure
- `app.py`: Flask application with RESTful API endpoints
- `models.py`: SQLAlchemy database models (Game, Player, GameSession, GamePlayer)
- `scraper.py`: BGG web scraper using BeautifulSoup
- `ai_suggestions.py`: Claude API integration for game suggestions
- SQLite database at `data/games.db`

### Frontend Structure
- React app with React Router for navigation
- Tailwind CSS for styling
- Component organization:
  - `pages/`: Route components (GamesPage, SessionsPage, etc.)
  - `components/`: Reusable UI components (GameCard, AddGameModal, etc.)
  - `services/api.js`: Axios API client

### Key API Endpoints
- `GET/POST /api/games`: Manage games collection
- `GET/POST /api/sessions`: Log and view game sessions
- `POST /api/suggest`: Get AI game suggestions
- `GET /api/statistics`: Fetch aggregated statistics

## Important Implementation Details

1. **BGG Scraping**: The scraper respects rate limits with a 1-second delay between requests
2. **Database Relations**: Games have sessions, sessions have players through a many-to-many relationship
3. **AI Integration**: Requires ANTHROPIC_API_KEY environment variable for Claude suggestions
4. **CORS**: Enabled for local development between React (3000) and Flask (5002)
5. **Proxy Configuration**: Frontend uses proxy in package.json to route API calls to backend port 5002
6. **Winner Calculation**: Sessions track both scores and explicit winner flags

## Testing

### Backend Tests
```bash
cd /root/projects/board_game_tracker/backend
pytest                                 # Run all backend tests
pytest -v                             # Verbose output with test names
pytest --cov=. --cov-report=html      # Run with coverage report
```

### Frontend Tests
```bash
cd /root/projects/board_game_tracker/frontend
npm test                               # Run all frontend tests (interactive)
npm test -- --coverage                # Run with coverage report
npm test -- --watchAll=false          # Run once without watch mode
```

### Test Infrastructure
- Backend tests use pytest with fixtures for database isolation
- Frontend tests use Jest and React Testing Library
- Tests are isolated from production database using environment variables
- Comprehensive test suite covers API endpoints, models, components, and integration scenarios

## Git Best Practices

- **IMPORTANT**: Before committing any changes, ALWAYS run the backend test suite to ensure code quality:
  ```bash
  cd /root/projects/board_game_tracker/backend && pytest -v
  ```
- **IMPORTANT**: Use the `./bgt` script for all server management tasks:
  ```bash
  cd /root/projects/board_game_tracker && ./bgt status    # Check servers
  cd /root/projects/board_game_tracker && ./bgt restart   # Restart after changes
  ```
- **IMPORTANT**: When updating documentation, ensure all three documentation files are kept in sync:
  ```bash
  # Always review and update these files together:
  # - README.md (main project docs)
  # - SCRIPTS_README.md (script documentation) 
  # - CLAUDE.md (this file)
  ```
- Backend tests must pass successfully before committing
- Frontend tests are comprehensive but some may need updates - run `cd /root/projects/board_game_tracker/frontend && npm test -- --watchAll=false` to check status
- When committing changes, ALWAYS use `git add -A` instead of `git add .` to ensure all changes across the entire repository are staged, including untracked files and changes outside the current directory
- Verify all changes are staged with `git status` before committing
- After completing larger changes or features that are working properly, proactively suggest pushing to git with `git push`