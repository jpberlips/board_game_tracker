import React, { useState, useEffect } from 'react';
import RulebookInput from './RulebookInput';

function EditGameModal({ game, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    bgg_id: '',
    owner: '',
    location: '',
    acquisition_price: '',
    personal_rating: '',
    purchase_date: '',
    rulebook_pdf: '',
    rulebook_url: '',
  });

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        bgg_id: game.bgg_id || '',
        owner: game.owner || '',
        location: game.location || '',
        acquisition_price: game.acquisition_price || '',
        personal_rating: game.personal_rating || '',
        purchase_date: game.purchase_date ? game.purchase_date.split('T')[0] : '',
        rulebook_pdf: game.rulebook_pdf || '',
        rulebook_url: game.rulebook_url || '',
      });
    }
  }, [game]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      bgg_id: formData.bgg_id ? parseInt(formData.bgg_id) : null,
      acquisition_price: formData.acquisition_price ? parseFloat(formData.acquisition_price) : null,
      personal_rating: formData.personal_rating ? parseFloat(formData.personal_rating) : null,
      purchase_date: formData.purchase_date || null,
    };
    onSave(data);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Game</h2>
          <button
            type="button"
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
              placeholder="e.g., 13 for Catan"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the BoardGameGeek ID to auto-fetch game details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., John's house"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Purchase Price
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
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Personal Rating
              </label>
              <select
                name="personal_rating"
                value={formData.personal_rating}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Rate this game</option>
                <option value="10">⭐⭐⭐⭐⭐ 10 - Perfect</option>
                <option value="9">⭐⭐⭐⭐⭐ 9 - Excellent</option>
                <option value="8">⭐⭐⭐⭐ 8 - Very Good</option>
                <option value="7">⭐⭐⭐⭐ 7 - Good</option>
                <option value="6">⭐⭐⭐ 6 - Fine</option>
                <option value="5">⭐⭐⭐ 5 - Average</option>
                <option value="4">⭐⭐ 4 - Below Average</option>
                <option value="3">⭐⭐ 3 - Poor</option>
                <option value="2">⭐ 2 - Bad</option>
                <option value="1">⭐ 1 - Awful</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <RulebookInput
            onFileUpload={(filePath, url) => {
              setFormData(prev => ({ ...prev, rulebook_pdf: filePath }));
            }}
            onUrlChange={(url) => {
              setFormData(prev => ({ ...prev, rulebook_url: url }));
            }}
            currentFile={formData.rulebook_pdf}
            currentUrl={formData.rulebook_url}
            onRemoveFile={() => {
              setFormData(prev => ({ ...prev, rulebook_pdf: '' }));
            }}
            onRemoveUrl={() => {
              setFormData(prev => ({ ...prev, rulebook_url: '' }));
            }}
          />

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGameModal;