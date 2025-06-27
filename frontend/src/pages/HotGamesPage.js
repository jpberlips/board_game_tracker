import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import LazyImage from '../components/LazyImage';

function HotGamesPage() {
  const { showSuccess, showError } = useToast();
  const [hotGames, setHotGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotGames();
  }, []);

  const fetchHotGames = async () => {
    try {
      const response = await fetch('/api/bgg/hot');
      if (response.ok) {
        const data = await response.json();
        setHotGames(data);
      } else {
        showError('Failed to load BGG hot games');
      }
    } catch (error) {
      console.error('Error fetching hot games:', error);
      showError('Failed to load BGG hot games');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (game) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: game.name,
          bgg_id: game.bgg_id,
          priority: 'medium',
          notes: `From BGG Hot Games${game.year ? ` (${game.year})` : ''}`,
        }),
      });
      
      if (response.ok) {
        showSuccess(`${game.name} added to wishlist!`);
      } else {
        showError('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showError('Failed to add to wishlist');
    }
  };

  const addToCollection = async (game) => {
    const owner = prompt('Who owns this game?');
    if (!owner) return;
    
    const location = prompt('Where is it stored? (optional)') || '';

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: game.name,
          bgg_id: game.bgg_id,
          owner: owner,
          location: location,
        }),
      });
      
      if (response.ok) {
        showSuccess(`${game.name} added to collection!`);
      } else {
        showError('Failed to add to collection');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      showError('Failed to add to collection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading BGG Hot Games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🔥 BGG Hot Games
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Trending games from BoardGameGeek
        </p>
        <button
          onClick={fetchHotGames}
          className="mt-4 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Hot Games Grid */}
      {hotGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotGames.map((game, index) => (
            <div
              key={game.bgg_id || index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {game.image_url && (
                <LazyImage
                  src={game.image_url}
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1">
                    {game.name}
                  </h3>
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium ml-2">
                    #{index + 1}
                  </span>
                </div>

                {/* Game Info */}
                <div className="space-y-2 mb-4">
                  {game.year && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {game.year}
                    </div>
                  )}
                  
                  {game.rating && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {game.rating.toFixed(1)} / 10
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToWishlist(game)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Wishlist
                    </button>
                    
                    <button
                      onClick={() => addToCollection(game)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Own It
                    </button>
                  </div>
                  
                  {game.bgg_id && (
                    <a
                      href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                      </svg>
                      View on BGG
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔥</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No hot games found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Unable to load trending games from BoardGameGeek
          </p>
          <button
            onClick={fetchHotGames}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default HotGamesPage;