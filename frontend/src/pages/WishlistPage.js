import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import WishlistCard from '../components/WishlistCard';
import AddWishlistModal from '../components/AddWishlistModal';

function WishlistPage() {
  const { showSuccess, showError } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddItem = async (itemData) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (response.ok) {
        await fetchWishlist();
        setShowAddModal(false);
        showSuccess('Game added to wishlist!');
      } else {
        showError('Failed to add game to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showError('Failed to add game to wishlist');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      try {
        const response = await fetch(`/api/wishlist/${itemId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchWishlist();
          showSuccess('Item removed from wishlist');
        } else {
          showError('Failed to remove item');
        }
      } catch (error) {
        console.error('Error deleting wishlist item:', error);
        showError('Failed to remove item');
      }
    }
  };

  const handleMoveToCollection = async (itemId, collectionData) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}/move-to-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });
      
      if (response.ok) {
        await fetchWishlist();
        showSuccess('Game moved to collection!');
      } else {
        showError('Failed to move game to collection');
      }
    } catch (error) {
      console.error('Error moving to collection:', error);
      showError('Failed to move game to collection');
    }
  };

  const filteredWishlist = filterPriority 
    ? wishlist.filter(item => item.priority === filterPriority)
    : wishlist;

  const priorityGroups = {
    high: filteredWishlist.filter(item => item.priority === 'high'),
    medium: filteredWishlist.filter(item => item.priority === 'medium'),
    low: filteredWishlist.filter(item => item.priority === 'low')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎯 Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Games you want to add to your collection
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          + Add to Wishlist
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Priority:
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredWishlist.length} games
          </span>
        </div>
      </div>

      {/* Priority Groups */}
      {!filterPriority ? (
        <div className="space-y-8">
          {Object.entries(priorityGroups).map(([priority, items]) => (
            items.length > 0 && (
              <div key={priority}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {priority === 'high' ? '🔥 High Priority' : 
                     priority === 'medium' ? '⭐ Medium Priority' : 
                     '💭 Low Priority'}
                  </h2>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteItem}
                      onMoveToCollection={handleMoveToCollection}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onDelete={handleDeleteItem}
              onMoveToCollection={handleMoveToCollection}
            />
          ))}
        </div>
      )}

      {wishlist.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start adding games you want to your wishlist!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Your First Game
          </button>
        </div>
      )}

      {showAddModal && (
        <AddWishlistModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}

export default WishlistPage;