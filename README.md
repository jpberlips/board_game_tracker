# 🎲 Board Game Tracker

A comprehensive full-stack web application designed to help board game enthusiasts track their collections, log game sessions, and discover new games through AI-powered recommendations.

![Board Game Tracker](https://img.shields.io/badge/Status-Active-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-blue)

## ✨ Features

### 🎮 Core Functionality
- **Game Collection Management**: Comprehensive tracking of your board game library with owner and location details
- **Session Logging**: Record detailed game sessions including players, scores, winners, and timestamps
- **Player Management**: Track individual player statistics and performance over time
- **Wishlist Management**: Maintain a wishlist of games you want to acquire

### 🌐 Integrations
- **BoardGameGeek (BGG) Integration**: 
  - Automatically fetch game details, images, and metadata
  - Browse BGG's current "Hot Games" list
  - Search BGG database directly from the app
- **AI-Powered Suggestions**: Get personalized game recommendations using Claude AI based on:
  - Player count preferences
  - Game complexity
  - Previous gaming history
  - Purchase recommendations with store suggestions

### 📊 Analytics & Insights
- **Statistics Dashboard**: Comprehensive analytics including:
  - Collection overview and growth tracking
  - Most played games and frequency analysis
  - Player performance and win rates
  - Gaming session trends over time
- **Visual Charts**: Interactive charts powered by Chart.js

### 🎨 User Experience
- **Responsive Design**: Fully responsive interface built with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Toast Notifications**: Real-time feedback for user actions
- **Skeleton Loading**: Smooth loading states for better UX

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 14+** with npm
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jpberlips/board_game_tracker.git
cd board_game_tracker
```

2. **Set up the backend:**
```bash
cd backend
pip3 install -r requirements.txt
```

3. **Set up the frontend:**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables (optional):**
Create a `.env` file in the `backend` directory for AI features:
```bash
# backend/.env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### Running the Application

#### Development Mode

1. **Start the backend server:**
```bash
cd backend
python3 app.py
```
🌐 Backend API runs on http://localhost:5002

2. **Start the frontend development server:**
```bash
cd frontend
npm start
```
🌐 Frontend runs on http://localhost:3000

The frontend automatically proxies API requests to the backend during development.

#### Production Deployment

For production deployment, see the included deployment scripts:
- `start.sh` - Starts both backend and frontend services
- `stop.sh` - Stops all services
- `boardgametracker.service` - Systemd service configuration

## 📖 User Guide

### 🎮 Managing Your Game Collection

**Adding Games:**
1. Navigate to the **Games** page
2. Click **"Add Game"**
3. Fill in game details (name, owner, location)
4. *Optional*: Enter BGG ID for automatic metadata fetching
5. Click **"Add Game"** to save

**Editing Games:**
- Click the edit icon on any game card
- Update details and save changes
- Delete games you no longer own

### 📝 Logging Game Sessions

**Recording Sessions:**
1. Go to the **Sessions** page
2. Click **"Log New Session"**
3. Select game and date
4. Add players and their scores
5. Mark winners manually or use **"Auto-calculate winners"**
6. Save the session

**Session History:**
- View all past sessions with filters
- Edit or delete sessions as needed
- Track player performance over time

### 🎯 Getting Game Recommendations

**AI Suggestions:**
1. Visit the **Suggestions** page
2. Specify player count and preferences
3. Get personalized recommendations based on your collection
4. Receive purchase suggestions with store links

*Note: Requires `ANTHROPIC_API_KEY` in your environment*

### 🔥 Discovering Hot Games

**BGG Hot Games:**
- Browse currently trending games on BoardGameGeek
- Add games directly to your wishlist
- Quick-add to your collection with location details

### 📊 Analytics & Statistics

**Dashboard Features:**
- Collection overview and growth metrics
- Most played games analysis
- Player performance statistics
- Session frequency trends
- Visual charts and graphs

## 🏗️ Architecture

### Backend (Flask)
- **RESTful API** with comprehensive endpoints
- **SQLAlchemy ORM** for database operations
- **BGG Web Scraper** with rate limiting
- **Claude AI Integration** for recommendations
- **CORS enabled** for cross-origin requests

### Frontend (React)
- **Component-based architecture** with React Router
- **Responsive design** using Tailwind CSS
- **Context API** for theme and notifications
- **Axios** for API communication
- **Chart.js** for data visualization

### Database Schema
- **SQLite** database with four main tables:
  - `games` - Game collection with metadata
  - `players` - Player information
  - `game_sessions` - Session records
  - `game_players` - Many-to-many relationship for session participants

## 🛠️ Technologies

| Category | Technologies |
|----------|-------------|
| **Backend** | Python 3.8+, Flask 3.0, SQLAlchemy 2.0, BeautifulSoup4 |
| **Frontend** | React 18, Tailwind CSS, Axios, Chart.js |
| **Database** | SQLite |
| **AI/ML** | Claude API (Anthropic) |
| **Deployment** | Systemd, Nginx (reverse proxy) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Repository**: [https://github.com/jpberlips/board_game_tracker](https://github.com/jpberlips/board_game_tracker)
- **BoardGameGeek**: [https://boardgamegeek.com/](https://boardgamegeek.com/)
- **Claude AI**: [https://claude.ai/](https://claude.ai/)