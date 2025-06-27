import React, { useState } from 'react';

function SessionCard({ session, onEdit, onDelete }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const winners = session.players.filter(p => p.is_winner);
  const sortedPlayers = [...session.players].sort((a, b) => {
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex gap-4">
        {/* Left side - Content (50%) */}
        <div className="flex-1">
          <div className="flex items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{session.game?.name}</h3>
              <p className="text-gray-600">{formatDate(session.date)}</p>
            </div>
            {session.game?.image_url && (
              <img
                src={session.game.image_url}
                alt={session.game.name}
                className="w-16 h-16 object-cover rounded ml-2"
                title="Game cover"
              />
            )}
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Players & Scores:</h4>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    player.is_winner ? 'bg-yellow-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 w-6">{index + 1}.</span>
                    <span className={player.is_winner ? 'font-bold' : ''}>
                      {player.player.name}
                    </span>
                    {player.is_winner && (
                      <span className="text-yellow-600 text-sm">👑 Winner</span>
                    )}
                  </div>
                  {player.score !== null && (
                    <span className="font-semibold">{player.score} points</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {session.notes && (
            <div className="border-t pt-4 mb-4">
              <p className="text-gray-600 italic">{session.notes}</p>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(session)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(session.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Session Photo (50%) */}
        {session.photo_url && (
          <div className="flex-1 relative">
            <img
              src={`/api/uploads/${session.photo_url}`}
              alt="Session"
              className="w-full h-full max-h-[300px] object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              title="Hover to see full size"
              onMouseEnter={() => setShowFullImage(true)}
              onMouseLeave={() => setShowFullImage(false)}
            />
            
            {/* Full size overlay on hover */}
            {showFullImage && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 pointer-events-none">
                <img
                  src={`/api/uploads/${session.photo_url}`}
                  alt="Session full size"
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionCard;