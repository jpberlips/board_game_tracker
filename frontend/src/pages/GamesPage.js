import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import GameCard from '../components/GameCard';
import GameCardSkeleton from '../components/GameCardSkeleton';
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';

function GamesPage() {
  const { showSuccess, showError } = useToast();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterPlayerCount, setFilterPlayerCount] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.getGames();
      setGames(response.data);
      setFilteredGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort games
  useEffect(() => {
    let filtered = [...games];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply owner filter
    if (filterOwner) {
      filtered = filtered.filter(game => game.owner === filterOwner);
    }

    // Apply player count filter
    if (filterPlayerCount) {
      const playerCount = parseInt(filterPlayerCount);
      filtered = filtered.filter(game => {
        if (!game.min_players || !game.max_players) return true;
        return game.min_players <= playerCount && game.max_players >= playerCount;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'complexity':
          return (b.complexity || 0) - (a.complexity || 0);
        case 'playing_time':
          return (b.playing_time || 0) - (a.playing_time || 0);
        case 'rank_overall':
          return (a.rank_overall || 9999) - (b.rank_overall || 9999);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredGames(filtered);
  }, [games, searchTerm, filterOwner, filterPlayerCount, sortBy]);

  const handleAddGame = async (gameData) => {
    try {
      await api.createGame(gameData);
      await fetchGames();
      setShowAddModal(false);
      showSuccess('Game added successfully!');
    } catch (error) {
      console.error('Error adding game:', error);
      showError('Failed to add game. Please try again.');
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (gameData) => {
    try {
      await api.updateGame(editingGame.id, gameData);
      await fetchGames();
      setShowEditModal(false);
      setEditingGame(null);
      showSuccess('Game updated successfully!');
    } catch (error) {
      console.error('Error updating game:', error);
      showError('Failed to update game. Please try again.');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await api.deleteGame(gameId);
        await fetchGames();
        showSuccess('Game deleted successfully!');
      } catch (error) {
        console.error('Error deleting game:', error);
        showError('Failed to delete game. Please try again.');
      }
    }
  };

  // Get unique owners for filter dropdown
  const uniqueOwners = [...new Set(games.map(game => game.owner))].sort();

  if (loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Board Games Collection</h1>
          <div className="h-10 bg-gray-300 rounded w-full sm:w-32 animate-pulse"></div>
        </div>
        
        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="h-4 bg-gray-300 rounded mb-1 w-24"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded mb-1 w-16"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded mb-1 w-20"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded mb-1 w-16"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Game Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Board Games Collection</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
        >
          Add Game
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Games
            </label>
            <input
              type="text"
              placeholder="Search by name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Owner Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owner
            </label>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Owners</option>
              {uniqueOwners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>

          {/* Player Count Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Player Count
            </label>
            <select
              value={filterPlayerCount}
              onChange={(e) => setFilterPlayerCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Any Count</option>
              <option value="1">1 Player</option>
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
              <option value="5">5 Players</option>
              <option value="6">6+ Players</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Name</option>
              <option value="complexity">Complexity</option>
              <option value="playing_time">Play Time</option>
              <option value="rank_overall">BGG Rank</option>
              <option value="created_at">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredGames.length} of {games.length} games
          </p>
          {(searchTerm || filterOwner || filterPlayerCount) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterOwner('');
                setFilterPlayerCount('');
              }}
              className="text-sm text-blue-500 hover:text-blue-700 self-start sm:self-center"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onEdit={handleEditGame}
            onDelete={() => handleDeleteGame(game.id)}
          />
        ))}
      </div>

      {filteredGames.length === 0 && games.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No games match your current filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterOwner('');
              setFilterPlayerCount('');
            }}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {showAddModal && (
        <AddGameModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddGame}
        />
      )}

      {showEditModal && (
        <EditGameModal
          game={editingGame}
          onClose={() => {
            setShowEditModal(false);
            setEditingGame(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default GamesPage;