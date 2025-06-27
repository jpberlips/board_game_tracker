import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Prepare data for charts
  const gamesOwnershipData = stats ? {
    labels: stats.games_by_owner.map(([owner]) => owner),
    datasets: [
      {
        data: stats.games_by_owner.map(([, count]) => count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  } : null;

  const playFrequencyData = stats && stats.play_frequency.length > 0 ? {
    labels: stats.play_frequency.map(([month]) => month),
    datasets: [
      {
        label: 'Game Sessions',
        data: stats.play_frequency.map(([, count]) => count),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  const personalRatingsData = stats && stats.personal_ratings.rating_distribution.length > 0 ? {
    labels: stats.personal_ratings.rating_distribution.map(([rating]) => `${rating}/10`),
    datasets: [
      {
        label: 'Number of Games',
        data: stats.personal_ratings.rating_distribution.map(([, count]) => count),
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1,
      },
    ],
  } : null;

  const mostPlayedGamesData = stats ? {
    labels: stats.most_played.slice(0, 10).map(([game]) => game.length > 15 ? game.substring(0, 15) + '...' : game),
    datasets: [
      {
        label: 'Number of Plays',
        data: stats.most_played.slice(0, 10).map(([, count]) => count),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  } : null;

  const playerWinRateData = stats ? {
    labels: stats.player_stats
      .filter(player => player.games_played >= 3)
      .sort((a, b) => b.win_rate - a.win_rate)
      .slice(0, 8)
      .map(player => player.name),
    datasets: [
      {
        label: 'Win Rate (%)',
        data: stats.player_stats
          .filter(player => player.games_played >= 3)
          .sort((a, b) => b.win_rate - a.win_rate)
          .slice(0, 8)
          .map(player => (player.win_rate * 100).toFixed(1)),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Statistics Available</h2>
          <p className="text-gray-600 dark:text-gray-300">Start playing some games to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 Gaming Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Insights into your board game collection and play patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">🎲</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Total Games</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_games}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Total Sessions</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.total_sessions}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Unique Players</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.player_stats.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Collection Value</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.collection_value.total_current_new.toFixed(0)} kr
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Market Value</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Games by Owner Chart */}
        {gamesOwnershipData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">📚</span>
              Collection Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={gamesOwnershipData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Most Played Games Chart */}
        {mostPlayedGamesData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🔥</span>
              Most Played Games
            </h3>
            <div className="h-64">
              <Bar data={mostPlayedGamesData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Player Win Rates Chart */}
        {playerWinRateData && playerWinRateData.labels.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🏅</span>
              Top Player Win Rates
            </h3>
            <div className="h-64">
              <Bar data={playerWinRateData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Play Frequency Trends */}
        {playFrequencyData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">📈</span>
              Play Frequency (Last 12 Months)
            </h3>
            <div className="h-64">
              <Line data={playFrequencyData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Personal Ratings Distribution */}
        {personalRatingsData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">⭐</span>
              Personal Ratings Distribution
            </h3>
            <div className="h-64">
              <Bar data={personalRatingsData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Collection Value Section */}
      {stats.collection_value.games_with_price_data > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">💎</span>
            Collection Value Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.collection_value.total_current_new.toFixed(0)} kr
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Current Value (New)</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.collection_value.total_paid.toFixed(0)} kr
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Paid</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.collection_value.avg_game_value.toFixed(0)} kr
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Avg Game Value</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {((stats.collection_value.total_current_new - stats.collection_value.total_paid) / Math.max(stats.collection_value.total_paid, 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Portfolio Gain</div>
            </div>
          </div>

          {stats.collection_value.most_valuable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Most Valuable Game</h4>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.collection_value.most_valuable.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{stats.collection_value.most_valuable.value} kr</p>
              </div>
              
              {stats.collection_value.best_deal && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Investment</h4>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.collection_value.best_deal.name}</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Paid {stats.collection_value.best_deal.paid} kr → Worth {stats.collection_value.best_deal.current_value} kr 
                    ({(stats.collection_value.best_deal.profit_ratio * 100).toFixed(0)}% gain)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Personal Ratings Section */}
      {stats.personal_ratings.avg_rating > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🌟</span>
            Personal Ratings Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.personal_ratings.avg_rating.toFixed(1)}/10
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Average Rating</div>
            </div>
            
            {stats.personal_ratings.highest_rated && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Highest Rated</h4>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.personal_ratings.highest_rated.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{stats.personal_ratings.highest_rated.rating}/10</p>
              </div>
            )}
            
            {stats.personal_ratings.lowest_rated && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Lowest Rated</h4>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.personal_ratings.lowest_rated.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{stats.personal_ratings.lowest_rated.rating}/10</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Games by Owner List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">👤</span>
            Collection by Owner
          </h3>
          <div className="space-y-3">
            {stats.games_by_owner.map(([owner, count]) => (
              <div key={owner} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">{owner}</span>
                <span className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 px-3 py-1 rounded-full text-sm">
                  {count} games
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Statistics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">📊</span>
            Detailed Player Statistics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700 dark:text-gray-300">Player</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 dark:text-gray-300">Games Played</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 dark:text-gray-300">Wins</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 dark:text-gray-300">Win Rate</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 dark:text-gray-300">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.player_stats
                .sort((a, b) => b.games_played - a.games_played)
                .map((player, index) => {
                  const winRate = player.games_played > 0 ? player.win_rate * 100 : 0;
                  let performanceIcon = '🎯';
                  if (winRate >= 60) performanceIcon = '🏆';
                  else if (winRate >= 40) performanceIcon = '🥈';
                  else if (winRate >= 20) performanceIcon = '🥉';
                  else performanceIcon = '🎮';

                  return (
                    <tr key={player.name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">{performanceIcon}</div>
                          <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">{player.games_played}</td>
                      <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">{player.wins}</td>
                      <td className="text-center py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          winRate >= 50 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : winRate >= 30
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {player.games_played > 0 ? `${winRate.toFixed(1)}%` : '-'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="flex justify-center">
                          <div className={`w-16 h-2 rounded-full ${
                            winRate >= 60 ? 'bg-green-400' :
                            winRate >= 40 ? 'bg-yellow-400' :
                            winRate >= 20 ? 'bg-orange-400' : 'bg-red-400'
                          }`}>
                            <div 
                              className="h-full bg-current rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(winRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gaming Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Collection Insights
          </h4>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• You have {stats.total_games} games in your collection</li>
            <li>• Most active owner: {stats.games_by_owner[0] ? stats.games_by_owner[0][0] : 'N/A'}</li>
            {stats.most_played.length > 0 && (
              <li>• Your group's favorite: {stats.most_played[0][0]}</li>
            )}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2 flex items-center">
            <span className="mr-2">🎲</span>
            Gaming Activity
          </h4>
          <ul className="space-y-2 text-green-800 dark:text-green-200">
            <li>• {stats.total_sessions} total game sessions recorded</li>
            <li>• {stats.player_stats.length} unique players have joined</li>
            {stats.player_stats.length > 0 && (
              <li>• Most active player: {stats.player_stats.sort((a, b) => b.games_played - a.games_played)[0].name}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;