# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Game Tracker is a full-stack web application for tracking board game collections and game sessions. It features BGG (BoardGameGeek) integration for auto-fetching game details and Claude AI integration for game suggestions.

## Development Commands

**IMPORTANT**: Always use absolute paths when using `cd` commands to avoid confusion and ensure you're in the correct directory.

### Project Paths
- **Project Root**: `/root/projects/board_game_tracker/`
- **Backend**: `/root/projects/board_game_tracker/backend/`
- **Frontend**: `/root/projects/board_game_tracker/frontend/`

### Backend
```bash
cd /root/projects/board_game_tracker/backend
pip3 install -r requirements.txt  # Install dependencies
python app.py                      # Run Flask server (port 5002)
# Or run in background: nohup python3 app.py > app.log 2>&1 &
```

### Frontend
```bash
cd /root/projects/board_game_tracker/frontend
npm install                        # Install dependencies
npm start                          # Run React dev server (port 3000)
npm run build                      # Build for production
```

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
- Backend tests must pass successfully before committing
- Frontend tests are comprehensive but some may need updates - run `cd /root/projects/board_game_tracker/frontend && npm test -- --watchAll=false` to check status
- When committing changes, ALWAYS use `git add -A` instead of `git add .` to ensure all changes across the entire repository are staged, including untracked files and changes outside the current directory
- Verify all changes are staged with `git status` before committing
- After completing larger changes or features that are working properly, proactively suggest pushing to git with `git push`