import axios from 'axios';

const API_BASE_URL = '/api';

const api = {
  // Games
  getGames: () => axios.get(`${API_BASE_URL}/games`),
  getGame: (id) => axios.get(`${API_BASE_URL}/games/${id}`),
  createGame: (game) => axios.post(`${API_BASE_URL}/games`, game),
  updateGame: (id, game) => axios.put(`${API_BASE_URL}/games/${id}`, game),
  deleteGame: (id) => axios.delete(`${API_BASE_URL}/games/${id}`),

  // Sessions
  getSessions: () => axios.get(`${API_BASE_URL}/sessions`),
  getSession: (id) => axios.get(`${API_BASE_URL}/sessions/${id}`),
  createSession: (session) => axios.post(`${API_BASE_URL}/sessions`, session),
  updateSession: (id, session) => axios.put(`${API_BASE_URL}/sessions/${id}`, session),
  deleteSession: (id) => axios.delete(`${API_BASE_URL}/sessions/${id}`),

  // Players
  getPlayers: () => axios.get(`${API_BASE_URL}/players`),

  // Suggestions
  getSuggestion: (data) => axios.post(`${API_BASE_URL}/suggest`, data),
  getPurchaseSuggestion: (data) => axios.post(`${API_BASE_URL}/suggest-purchase`, data),

  // Statistics
  getStatistics: () => axios.get(`${API_BASE_URL}/statistics`),
  
  // BGG
  searchBGG: (query) => axios.get(`${API_BASE_URL}/bgg/search?q=${encodeURIComponent(query)}`),
  
  // Wishlist
  createWishlistItem: (item) => axios.post(`${API_BASE_URL}/wishlist`, item),
};

export default api;