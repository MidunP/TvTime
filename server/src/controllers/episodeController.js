const WatchedEpisode = require('../models/WatchedEpisode');
const WatchlistItem = require('../models/WatchlistItem');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/episodes/watch
const markWatched = asyncHandler(async (req, res) => {
  const { tmdbShowId, season, episode, episodeName, runtime, airDate } = req.body;

  // Upsert: create or update (in case of rewatch)
  const ep = await WatchedEpisode.findOneAndUpdate(
    { userId: req.user._id, tmdbShowId, season, episode },
    {
      $set: {
        episodeName,
        runtime: runtime || 0,
        airDate,
        watchedAt: new Date(),
      },
      $setOnInsert: { rewatchCount: 0 },
    },
    { upsert: true, new: true }
  );

  // Update watchlist progress
  const watchedCount = await WatchedEpisode.countDocuments({
    userId: req.user._id,
    tmdbShowId,
  });

  await WatchlistItem.findOneAndUpdate(
    { userId: req.user._id, tmdbShowId },
    {
      $set: {
        watchedEpisodesCount: watchedCount,
        currentSeason: season,
        currentEpisode: episode,
        lastWatchedAt: new Date(),
        status: 'watching',
      },
    }
  );

  res.json({ episode: ep, watchedCount });
});

// DELETE /api/episodes/unwatch
const markUnwatched = asyncHandler(async (req, res) => {
  const { tmdbShowId, season, episode } = req.body;

  await WatchedEpisode.findOneAndDelete({
    userId: req.user._id,
    tmdbShowId,
    season,
    episode,
  });

  const watchedCount = await WatchedEpisode.countDocuments({
    userId: req.user._id,
    tmdbShowId,
  });

  await WatchlistItem.findOneAndUpdate(
    { userId: req.user._id, tmdbShowId },
    { $set: { watchedEpisodesCount: watchedCount } }
  );

  res.json({ message: 'Episode marked as unwatched', watchedCount });
});

// POST /api/episodes/rewatch
const markRewatched = asyncHandler(async (req, res) => {
  const { tmdbShowId, season, episode } = req.body;

  const ep = await WatchedEpisode.findOneAndUpdate(
    { userId: req.user._id, tmdbShowId, season, episode },
    {
      $inc: { rewatchCount: 1 },
      $set: { lastRewatchedAt: new Date() },
    },
    { new: true }
  );

  if (!ep) return res.status(404).json({ message: 'Episode not found in watched list' });
  res.json({ episode: ep });
});

// GET /api/episodes/recent
const getRecentlyWatched = asyncHandler(async (req, res) => {
  const episodes = await WatchedEpisode.find({ userId: req.user._id })
    .sort({ watchedAt: -1 })
    .limit(20);

  res.json({ episodes });
});

module.exports = { markWatched, markUnwatched, markRewatched, getRecentlyWatched };
