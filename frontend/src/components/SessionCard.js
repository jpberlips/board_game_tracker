import React from 'react';

function SessionCard({ session, onEdit, onDelete }) {
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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{session.game?.name}</h3>
          <p className="text-gray-600">{formatDate(session.date)}</p>
        </div>
        {session.game?.image_url && (
          <img
            src={session.game.image_url}
            alt={session.game.name}
            className="w-20 h-20 object-cover rounded"
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
        <div className="border-t pt-4">
          <p className="text-gray-600 italic">{session.notes}</p>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
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
  );
}

export default SessionCard;