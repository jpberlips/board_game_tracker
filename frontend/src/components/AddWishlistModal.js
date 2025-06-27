import React, { useState } from 'react';

function AddWishlistModal({ onClose, onAdd, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    bgg_id: initialData.bgg_id || '',
    priority: 'medium',
    notes: '',
    price_target: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      bgg_id: formData.bgg_id ? parseInt(formData.bgg_id) : null,
      price_target: formData.price_target ? parseFloat(formData.price_target) : null,
    };
    onAdd(data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add to Wishlist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Game Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter game name"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              BGG ID (optional)
            </label>
            <input
              type="number"
              name="bgg_id"
              value={formData.bgg_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="BoardGameGeek ID"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Will auto-fill game details if provided
            </p>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="high">🔥 High Priority</option>
              <option value="medium">⭐ Medium Priority</option>
              <option value="low">💭 Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Target Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">kr</span>
              <input
                type="number"
                name="price_target"
                value={formData.price_target}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Why do you want this game? Special edition? Sale alert?"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Add to Wishlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWishlistModal;