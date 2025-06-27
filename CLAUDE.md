# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Game Tracker is a full-stack web application for tracking board game collections and game sessions. It features BGG (BoardGameGeek) integration for auto-fetching game details and Claude AI integration for game suggestions.

## Development Commands

### Backend
```bash
cd backend
pip3 install -r requirements.txt  # Install dependencies
python app.py                      # Run Flask server (port 5000)
```

### Frontend
```bash
cd frontend
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
4. **CORS**: Enabled for local development between React (3000) and Flask (5000)
5. **Winner Calculation**: Sessions track both scores and explicit winner flags

## Git Best Practices

- When committing changes, ALWAYS use `git add -A` instead of `git add .` to ensure all changes across the entire repository are staged, including untracked files and changes outside the current directory
- Verify all changes are staged with `git status` before committing
- After completing larger changes or features that are working properly, proactively suggest pushing to git with `git push`