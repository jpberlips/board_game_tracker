import React, { useState } from 'react';

function MoveToCollectionModal({ item, onClose, onMove }) {
  const [formData, setFormData] = useState({
    owner: '',
    location: '',
    acquisition_price: '',
    purchased_today: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      acquisition_price: formData.acquisition_price ? parseFloat(formData.acquisition_price) : null,
    };
    onMove(item.id, data);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Move to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center text-green-700 dark:text-green-300">
            <span className="text-lg mr-2">🎉</span>
            <div>
              <div className="font-medium">Adding to Collection:</div>
              <div className="text-lg font-bold">{item.name}</div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Owner *
            </label>
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Who owns this game?"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Where is it stored?"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Purchase Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">kr</span>
              <input
                type="number"
                name="acquisition_price"
                value={formData.acquisition_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            {item.price_target && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target was: {item.price_target} kr
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="purchased_today"
              checked={formData.purchased_today}
              onChange={handleChange}
              className="mr-2 rounded"
            />
            <label className="text-gray-700 dark:text-gray-300 text-sm">
              Purchased today
            </label>
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
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Move to Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoveToCollectionModal;