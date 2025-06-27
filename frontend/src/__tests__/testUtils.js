/**
 * Test utilities for Board Game Tracker frontend tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

/**
 * Custom render function that includes necessary providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    theme = 'light',
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider initialTheme={theme}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Create mock API responses
 */
export const createMockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {
    'content-type': 'application/json',
  },
});

/**
 * Mock game data for testing
 */
export const mockGame = {
  id: 1,
  name: 'Test Game',
  owner: 'Test Owner',
  location: 'Test Shelf',
  bgg_id: 123456,
  min_players: 2,
  max_players: 4,
  playing_time: 60,
  complexity: 2.5,
  image_url: 'https://example.com/image.jpg',
  description: 'A test game for testing',
  rank_overall: 150,
  personal_rating: 8.0,
  acquisition_price: 49.99,
  purchase_date: '2023-01-15T00:00:00',
  tags: [],
  created_at: '2023-01-15T00:00:00'
};

/**
 * Mock player data for testing
 */
export const mockPlayer = {
  id: 1,
  name: 'Test Player',
  created_at: '2023-01-15T00:00:00'
};

/**
 * Mock session data for testing
 */
export const mockSession = {
  id: 1,
  game_id: 1,
  game: mockGame,
  date: '2023-06-15T19:30:00',
  notes: 'Great game night!',
  players: [
    {
      id: 1,
      player: mockPlayer,
      score: 95,
      is_winner: true
    },
    {
      id: 2,
      player: { ...mockPlayer, id: 2, name: 'Player 2' },
      score: 87,
      is_winner: false
    }
  ],
  created_at: '2023-06-15T19:30:00'
};

/**
 * Mock wishlist item data for testing
 */
export const mockWishlistItem = {
  id: 1,
  name: 'Desired Game',
  bgg_id: 789012,
  priority: 'high',
  notes: 'Want this game',
  price_target: 39.99,
  image_url: 'https://example.com/wishlist.jpg',
  complexity: 2.5,
  min_players: 2,
  max_players: 4,
  playing_time: 45,
  created_at: '2023-06-15T00:00:00'
};

/**
 * Mock statistics data for testing
 */
export const mockStatistics = {
  total_games: 10,
  total_sessions: 25,
  games_by_owner: [['Alice', 6], ['Bob', 4]],
  most_played: [['Game 1', 8], ['Game 2', 5], ['Game 3', 3]],
  collection_value: {
    total_msrp: 500.00,
    total_current_new: 450.00,
    total_current_used: 350.00,
    total_paid: 400.00,
    games_with_price_data: 8,
    avg_game_value: 56.25,
    most_valuable: { name: 'Expensive Game', value: 89.99 },
    best_deal: { 
      name: 'Great Deal', 
      paid: 30.00, 
      current_value: 60.00, 
      profit_ratio: 2.0 
    }
  },
  play_frequency: [['2023-01', 5], ['2023-02', 8], ['2023-03', 12]],
  personal_ratings: {
    avg_rating: 7.5,
    highest_rated: { name: 'Best Game', rating: 10.0 },
    lowest_rated: { name: 'Worst Game', rating: 4.0 },
    rating_distribution: [[6, 2], [7, 3], [8, 4], [9, 1]]
  },
  player_stats: [
    { name: 'Alice', games_played: 15, wins: 8, win_rate: 0.533 },
    { name: 'Bob', games_played: 12, wins: 4, win_rate: 0.333 }
  ]
};

/**
 * Mock BGG hot games data for testing
 */
export const mockHotGames = [
  {
    name: 'Hot Game 1',
    bgg_id: 123456,
    year: 2023,
    rating: 8.1,
    image_url: 'https://example.com/hot1.jpg',
    rank: 1
  },
  {
    name: 'Hot Game 2',
    bgg_id: 789012,
    year: 2022,
    rating: 7.8,
    image_url: 'https://example.com/hot2.jpg',
    rank: 2
  }
];

/**
 * Mock AI suggestion data for testing
 */
export const mockAISuggestion = {
  suggested_game: 'Perfect Game',
  reason: 'This game is ideal for your group because it perfectly matches your player count and preferences.'
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create mock form event
 */
export const createMockFormEvent = (formData = {}) => ({
  preventDefault: jest.fn(),
  target: {
    elements: Object.keys(formData).reduce((acc, key) => {
      acc[key] = { value: formData[key] };
      return acc;
    }, {}),
    reset: jest.fn()
  }
});

/**
 * Create mock file for file upload tests
 */
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg') => {
  return new File(['test content'], name, { type });
};

/**
 * Mock axios module for API testing
 */
export const createMockAxios = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => createMockAxios()),
});

/**
 * Assert that element has specific styles
 */
export const assertElementStyles = (element, styles) => {
  Object.entries(styles).forEach(([property, value]) => {
    expect(element).toHaveStyle({ [property]: value });
  });
};

/**
 * Wait for element to appear/disappear
 */
export const waitForElementState = async (queryFn, shouldExist = true, timeout = 3000) => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const element = queryFn();
    if ((shouldExist && element) || (!shouldExist && !element)) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error(`Element ${shouldExist ? 'did not appear' : 'did not disappear'} within ${timeout}ms`);
};

/**
 * Simulate user typing with delay
 */
export const simulateTyping = async (element, text, delay = 50) => {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Simulate character input
    element.value = text.substring(0, i + 1);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

/**
 * Mock intersection observer for lazy loading tests
 */
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  global.IntersectionObserver = jest.fn(() => mockObserver);
  
  return {
    triggerIntersection: (entries = []) => {
      const callback = global.IntersectionObserver.mock.calls[0][0];
      callback(entries.map(entry => ({ 
        isIntersecting, 
        target: entry,
        intersectionRatio: isIntersecting ? 1 : 0
      })));
    },
    mockObserver
  };
};