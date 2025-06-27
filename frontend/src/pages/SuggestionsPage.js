import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AddWishlistModal from '../components/AddWishlistModal';
import AddGameModal from '../components/AddGameModal';

function SuggestionsPage() {
  const { showSuccess, showError } = useToast();
  const [playerCount, setPlayerCount] = useState(4);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [preferences, setPreferences] = useState('');
  const [sessions, setSessions] = useState([]);
  
  // New purchase suggestion state
  const [purchasePlayerCount, setPurchasePlayerCount] = useState('');
  const [purchasePreferences, setPurchasePreferences] = useState('');
  const [purchaseSuggestion, setPurchaseSuggestion] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Modal states
  const [showAddToWishlist, setShowAddToWishlist] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedGameName, setSelectedGameName] = useState('');
  const [selectedBggId, setSelectedBggId] = useState('');

  useEffect(() => {
    fetchGames();
    fetchSessions();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.getGames();
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const getSuggestion = async () => {
    setLoading(true);
    try {
      // Get last 50 sessions for context
      const last50Sessions = sessions.slice(0, 50);
      
      const response = await api.getSuggestion({
        player_count: playerCount,
        preferences: preferences ? { 
          notes: preferences + (last50Sessions.length > 0 ? 
            '. Take some of this into consideration: Recently played games - ' + 
            last50Sessions.map(s => s.game_name).join(', ') : '')
        } : { 
          notes: last50Sessions.length > 0 ? 
            'Take some of this into consideration: Recently played games - ' + 
            last50Sessions.map(s => s.game_name).join(', ') : ''
        }
      });
      setSuggestion(response.data);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseSuggestion = async () => {
    setPurchaseLoading(true);
    try {
      // Get last 50 sessions for context
      const last50Sessions = sessions.slice(0, 50);
      
      // Create context with owned games and play history
      let contextNotes = 'IMPORTANT: Do NOT suggest any games I already own. ';
      
      contextNotes += 'Games I already own (DO NOT SUGGEST THESE): ' + games.map(g => g.name).join(', ') + '. ';
      
      contextNotes += 'Current collection details: ' + games.map(g => 
        `${g.name} (${g.min_players}-${g.max_players} players, complexity: ${g.complexity || 'unknown'}, BGG rank: ${g.rank_overall || 'unranked'})`
      ).join(', ');
      
      if (last50Sessions.length > 0) {
        contextNotes += '. Recently played games: ' + last50Sessions.map(s => s.game_name).join(', ');
      }
      
      if (purchasePreferences) {
        contextNotes = purchasePreferences + '. ' + contextNotes;
      }
      
      const response = await api.getPurchaseSuggestion({
        player_count: purchasePlayerCount ? parseInt(purchasePlayerCount) : null,
        preferences: { notes: contextNotes }
      });
      setPurchaseSuggestion(response.data);
    } catch (error) {
      console.error('Error getting purchase suggestion:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const suggestedGame = suggestion && games.find(g => g.name === suggestion.suggested_game);

  const searchBGG = async (gameName) => {
    try {
      const response = await api.searchBGG(gameName);
      if (response.data && response.data.length > 0) {
        const bggId = response.data[0].id;
        window.open(`https://boardgamegeek.com/boardgame/${bggId}`, '_blank');
      } else {
        // Fallback to BGG search page
        window.open(`https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(gameName)}`, '_blank');
      }
    } catch (error) {
      // Fallback to BGG search page
      window.open(`https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(gameName)}`, '_blank');
    }
  };

  const handleAddToWishlist = async (gameName) => {
    setSelectedGameName(gameName);
    // Search BGG for the game to get BGG ID
    try {
      const response = await api.searchBGG(gameName);
      if (response.data && response.data.length > 0) {
        // Use the first result
        const bggGame = response.data[0];
        setSelectedGameName(bggGame.name || gameName); // Use BGG's exact name
        setSelectedBggId(bggGame.id);
      } else {
        setSelectedBggId('');
      }
    } catch (error) {
      console.error('Error searching BGG:', error);
      setSelectedBggId('');
    }
    setShowAddToWishlist(true);
  };

  const handleAddToCollection = async (gameName) => {
    setSelectedGameName(gameName);
    // Search BGG for the game to get BGG ID
    try {
      const response = await api.searchBGG(gameName);
      if (response.data && response.data.length > 0) {
        // Use the first result
        const bggGame = response.data[0];
        setSelectedGameName(bggGame.name || gameName); // Use BGG's exact name
        setSelectedBggId(bggGame.id);
      } else {
        setSelectedBggId('');
      }
    } catch (error) {
      console.error('Error searching BGG:', error);
      setSelectedBggId('');
    }
    setShowAddToCollection(true);
  };

  const saveToWishlist = async (wishlistData) => {
    try {
      await api.createWishlistItem(wishlistData);
      showSuccess('Added to wishlist!');
      setShowAddToWishlist(false);
    } catch (error) {
      showError('Failed to add to wishlist');
    }
  };

  const saveToCollection = async (gameData) => {
    try {
      await api.createGame(gameData);
      showSuccess('Added to collection!');
      setShowAddToCollection(false);
      fetchGames(); // Refresh games list
    } catch (error) {
      showError('Failed to add to collection');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Game Suggestions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Play Tonight Suggestion Box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Suggest a game for tonight</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Number of Players
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Preferences (optional)
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., quick game, strategy, party game, etc."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={getSuggestion}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {loading ? 'Getting suggestion...' : 'Get Suggestion'}
          </button>
        </div>

        {/* Purchase Suggestion Box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Suggest a new game to buy</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Number of Players (optional)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={purchasePlayerCount}
            onChange={(e) => setPurchasePlayerCount(e.target.value)}
            placeholder="Leave empty for any player count"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Preferences (optional)
          </label>
          <textarea
            value={purchasePreferences}
            onChange={(e) => setPurchasePreferences(e.target.value)}
            placeholder="e.g., cooperative, deck building, under 500kr, etc."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={getPurchaseSuggestion}
          disabled={purchaseLoading}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {purchaseLoading ? 'Getting purchase suggestion...' : 'Get Purchase Suggestion'}
        </button>
        </div>
      </div>

      {suggestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Suggested Game for Tonight</h3>
          
          {suggestedGame ? (
            <div>
              <div className="flex items-start space-x-4">
                {suggestedGame.image_url && (
                  <img
                    src={suggestedGame.image_url}
                    alt={suggestedGame.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{suggestedGame.name}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p><span className="font-medium">Owner:</span> {suggestedGame.owner}</p>
                    <p><span className="font-medium">Location:</span> {suggestedGame.location}</p>
                    {suggestedGame.playing_time && (
                      <p><span className="font-medium">Play time:</span> {suggestedGame.playing_time} minutes</p>
                    )}
                    {suggestedGame.complexity && (
                      <p><span className="font-medium">Complexity:</span> {Number(suggestedGame.complexity).toFixed(1)}/5</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Why this game?</p>
                <p className="text-blue-800 dark:text-blue-200">{suggestion.reason}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-bold mb-2 text-gray-900 dark:text-white">{suggestion.suggested_game}</p>
              <p className="text-gray-700 dark:text-gray-300">{suggestion.reason}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => searchBGG(suggestion.suggested_game)}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                  </svg>
                  View on BGG
                </button>
                <button
                  onClick={() => handleAddToWishlist(suggestion.suggested_game)}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Add to Wishlist
                </button>
                {!suggestedGame && (
                  <button
                    onClick={() => handleAddToCollection(suggestion.suggested_game)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Add to Collection
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {purchaseSuggestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Suggested Game to Buy</h3>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="font-bold mb-2 text-green-900 dark:text-green-100">{purchaseSuggestion.suggested_game}</p>
            <p className="text-green-800 dark:text-green-200">{purchaseSuggestion.reason}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => searchBGG(purchaseSuggestion.suggested_game)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                </svg>
                View on BGG
              </button>
              <button
                onClick={() => handleAddToWishlist(purchaseSuggestion.suggested_game)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Add to Wishlist
              </button>
              <button
                onClick={() => handleAddToCollection(purchaseSuggestion.suggested_game)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Add to Collection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showAddToWishlist && (
        <AddWishlistModal
          onClose={() => {
            setShowAddToWishlist(false);
            setSelectedGameName('');
            setSelectedBggId('');
          }}
          onAdd={saveToWishlist}
          initialData={{
            name: selectedGameName,
            bgg_id: selectedBggId
          }}
        />
      )}
      
      {showAddToCollection && (
        <AddGameModal
          onClose={() => {
            setShowAddToCollection(false);
            setSelectedGameName('');
            setSelectedBggId('');
          }}
          onAdd={saveToCollection}
          initialData={{
            name: selectedGameName,
            bgg_id: selectedBggId
          }}
        />
      )}
    </div>
  );
}

export default SuggestionsPage;