import React, { useState } from 'react';
import LazyImage from './LazyImage';
import MoveToCollectionModal from './MoveToCollectionModal';

function WishlistCard({ item, onDelete, onMoveToCollection }) {
  const [showMoveModal, setShowMoveModal] = useState(false);

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  };

  const priorityIcons = {
    high: '🔥',
    medium: '⭐',
    low: '💭'
  };

  const playerCount = item.min_players === item.max_players && item.min_players
    ? `${item.min_players} players`
    : item.min_players && item.max_players
    ? `${item.min_players}-${item.max_players} players`
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      {item.image_url && (
        <LazyImage
          src={item.image_url}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight flex-1">
            {item.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${priorityColors[item.priority]}`}>
            {priorityIcons[item.priority]} {item.priority}
          </span>
        </div>

        {/* Game Stats */}
        {(playerCount || item.playing_time || item.complexity) && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {playerCount && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{playerCount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Players</div>
                </div>
              )}
              {item.playing_time && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{item.playing_time} min</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Play Time</div>
                </div>
              )}
              {item.complexity && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center col-span-2">
                  <div className="font-medium text-gray-900 dark:text-white">{item.complexity.toFixed(1)}/5</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Complexity</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Target */}
        {item.price_target && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <span className="text-lg mr-2">💰</span>
              <div>
                <div className="font-medium">Target Price</div>
                <div className="text-lg font-bold">{item.price_target} kr</div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Notes:</span> {item.notes}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
          {item.bgg_id && (
            <a
              href={`https://boardgamegeek.com/boardgame/${item.bgg_id}`}
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
          
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={() => setShowMoveModal(true)}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Got It!
            </button>
            
            <button
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>

      {showMoveModal && (
        <MoveToCollectionModal
          item={item}
          onClose={() => setShowMoveModal(false)}
          onMove={onMoveToCollection}
        />
      )}
    </div>
  );
}

export default WishlistCard;