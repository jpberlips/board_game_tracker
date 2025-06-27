import React from 'react';
import LazyImage from './LazyImage';

function GameCard({ game, onDelete, onEdit }) {
  const playerCount = game.min_players === game.max_players
    ? `${game.min_players} players`
    : `${game.min_players}-${game.max_players} players`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      {game.image_url && (
        <LazyImage
          src={game.image_url}
          alt={game.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white leading-tight">{game.name}</h3>
        
        {/* Owner and Location */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Owner:</span>
            <span className="ml-1">{game.owner}</span>
          </div>
          {game.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Location:</span>
              <span className="ml-1">{game.location}</span>
            </div>
          )}
        </div>

        {/* Game Stats - Horizontal Layout */}
        {(game.min_players || game.playing_time || game.complexity) && (
          <div className="mb-3">
            <div className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              {game.min_players && (
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{playerCount}</div>
                  <div className="text-gray-500 dark:text-gray-400">Players</div>
                </div>
              )}
              {game.playing_time && (
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{game.playing_time} min</div>
                  <div className="text-gray-500 dark:text-gray-400">Play Time</div>
                </div>
              )}
              {game.complexity && (
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{game.complexity.toFixed(1)}/5</div>
                  <div className="text-gray-500 dark:text-gray-400">Complexity</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Rating & Purchase Info - Single Row */}
        {(game.personal_rating || game.acquisition_price || game.purchase_date) && (
          <div className="mb-3">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 text-xs">
              {game.personal_rating && (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <span className="mr-1">⭐</span>
                  <span className="font-medium">{game.personal_rating}/10</span>
                </div>
              )}
              {game.acquisition_price && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-1">💰</span>
                  <span className="font-bold">{game.acquisition_price} kr</span>
                </div>
              )}
              {game.purchase_date && (
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(game.purchase_date).toLocaleDateString('sv-SE')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* BGG Rankings */}
        {(game.rank_overall || game.rank_strategy || game.rank_family) && (
          <div className="mb-4">
            <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">BGG Rankings</p>
            <div className="flex flex-wrap gap-2">
              {game.rank_overall && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                  #{game.rank_overall} Overall
                </span>
              )}
              {game.rank_strategy && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                  #{game.rank_strategy} Strategy
                </span>
              )}
              {game.rank_family && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                  #{game.rank_family} Family
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
          {game.bgg_id && (
            <a
              href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
              </svg>
              BGG
            </a>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(game)}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCard;