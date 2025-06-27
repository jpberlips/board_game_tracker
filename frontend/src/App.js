import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Logo from './components/Logo';
import GamesPage from './pages/GamesPage';
import SessionsPage from './pages/SessionsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import StatisticsPage from './pages/StatisticsPage';
import WishlistPage from './pages/WishlistPage';
import HotGamesPage from './pages/HotGamesPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:space-x-8">
                    <Link to="/" className="flex items-center py-3 sm:py-5 px-3">
                      <Logo />
                    </Link>
                    <div className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8 pb-3 sm:pb-0">
                      <Link to="/" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Games
                      </Link>
                      <Link to="/sessions" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Sessions
                      </Link>
                      <Link to="/suggest" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Suggest
                      </Link>
                      <Link to="/wishlist" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Wishlist
                      </Link>
                      <Link to="/hot" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Hot Games
                      </Link>
                      <Link to="/statistics" className="flex items-center py-2 sm:py-5 px-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Statistics
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center py-3 px-3">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<GamesPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/suggest" element={<SuggestionsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/hot" element={<HotGamesPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;