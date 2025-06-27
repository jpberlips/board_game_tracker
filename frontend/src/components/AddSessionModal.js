import React, { useState } from 'react';
import FileUpload from './FileUpload';

function AddSessionModal({ onClose, onAdd, games, existingPlayers }) {
  const [formData, setFormData] = useState({
    game_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    photo_url: '',
  });
  const [players, setPlayers] = useState([
    { name: '', score: '', is_winner: false }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sessionData = {
      ...formData,
      game_id: parseInt(formData.game_id),
      players: players.map(p => ({
        name: p.name,
        score: p.score ? parseInt(p.score) : null,
        is_winner: p.is_winner
      }))
    };
    onAdd(sessionData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    setPlayers([...players, { name: '', score: '', is_winner: false }]);
  };

  const removePlayer = (index) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const calculateWinners = () => {
    const scores = players
      .map((p, index) => ({ ...p, index }))
      .filter(p => p.score !== '')
      .map(p => ({ ...p, score: parseInt(p.score) }));
    
    if (scores.length === 0) return;

    const maxScore = Math.max(...scores.map(p => p.score));
    const newPlayers = [...players];
    newPlayers.forEach((p, i) => {
      p.is_winner = p.score !== '' && parseInt(p.score) === maxScore;
    });
    setPlayers(newPlayers);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <h2 className="text-2xl font-bold mb-4">Log Game Session</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Game *
            </label>
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a game</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Players *
              </label>
              <button
                type="button"
                onClick={calculateWinners}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Auto-calculate winners
              </button>
            </div>
            {players.map((player, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                  placeholder="Player name"
                  required
                  list="player-names"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={player.score}
                  onChange={(e) => handlePlayerChange(index, 'score', e.target.value)}
                  placeholder="Score"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={player.is_winner}
                    onChange={(e) => handlePlayerChange(index, 'is_winner', e.target.checked)}
                    className="mr-1"
                  />
                  Winner
                </label>
                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPlayer}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              + Add player
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <FileUpload
              accept="image/*"
              onFileUpload={(filePath, url) => {
                setFormData(prev => ({ ...prev, photo_url: filePath }));
              }}
              currentFile={formData.photo_url}
              onRemove={() => {
                setFormData(prev => ({ ...prev, photo_url: '' }));
              }}
              label="Session Photo (optional)"
              maxSize={16 * 1024 * 1024}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
            >
              Log Session
            </button>
          </div>
        </form>

        <datalist id="player-names">
          {existingPlayers.map(player => (
            <option key={player.id} value={player.name} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

export default AddSessionModal;