const WatchedEpisode = require('../models/WatchedEpisode');
const WatchlistItem = require('../models/WatchlistItem');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/stats
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    totalEpisodes,
    showsTracked,
    completedShows,
    allWatched,
  ] = await Promise.all([
    WatchedEpisode.countDocuments({ userId }),
    WatchlistItem.countDocuments({ userId }),
    WatchlistItem.countDocuments({ userId, status: 'completed' }),
    WatchedEpisode.find({ userId }).select('runtime watchedAt').lean(),
  ]);

  // Total hours watched
  const totalMinutes = allWatched.reduce((sum, ep) => sum + (ep.runtime || 0), 0);
  const hoursWatched = Math.floor(totalMinutes / 60);

  // Streak calculation
  const { currentStreak, longestStreak } = calculateStreak(allWatched);

  // Episodes per day for last 365 days (heatmap data)
  const heatmapData = buildHeatmap(allWatched);

  // Episodes this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const episodesThisWeek = allWatched.filter(
    (ep) => new Date(ep.watchedAt) >= weekAgo
  ).length;

  res.json({
    totalEpisodes,
    showsTracked,
    completedShows,
    hoursWatched,
    currentStreak,
    longestStreak,
    episodesThisWeek,
    heatmapData,
  });
});

function calculateStreak(episodes) {
  if (!episodes.length) return { currentStreak: 0, longestStreak: 0 };

  // Get unique dates (YYYY-MM-DD) sorted descending
  const dates = [
    ...new Set(
      episodes.map((ep) => new Date(ep.watchedAt).toISOString().split('T')[0])
    ),
  ].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak starts from today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff =
        (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

function buildHeatmap(episodes) {
  const map = {};
  episodes.forEach((ep) => {
    const date = new Date(ep.watchedAt).toISOString().split('T')[0];
    map[date] = (map[date] || 0) + 1;
  });
  return map;
}

module.exports = { getStats };
