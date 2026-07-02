const WatchlistItem = require('../models/WatchlistItem');
const WatchedEpisode = require('../models/WatchedEpisode');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/shows/add
const addShow = asyncHandler(async (req, res) => {
  const {
    tmdbShowId, showTitle, showPoster, showBackdrop,
    showYear, totalEpisodes, totalSeasons, genres, networks,
  } = req.body;

  const existing = await WatchlistItem.findOne({
    userId: req.user._id,
    tmdbShowId,
  });

  if (existing) {
    return res.status(409).json({ message: 'Show already in your list', item: existing });
  }

  const item = await WatchlistItem.create({
    userId: req.user._id,
    tmdbShowId,
    showTitle,
    showPoster,
    showBackdrop,
    showYear,
    totalEpisodes: totalEpisodes || 0,
    totalSeasons: totalSeasons || 0,
    genres: genres || [],
    networks: networks || [],
    status: 'watchlist',
  });

  res.status(201).json({ item });
});

// GET /api/shows/watchlist
const getWatchlist = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { userId: req.user._id };
  if (status) filter.status = status;

  const items = await WatchlistItem.find(filter).sort({ lastWatchedAt: -1, addedAt: -1 });
  res.json({ items });
});

// GET /api/shows/:tmdbId
const getShow = asyncHandler(async (req, res) => {
  const item = await WatchlistItem.findOne({
    userId: req.user._id,
    tmdbShowId: parseInt(req.params.tmdbId),
  });

  if (!item) {
    return res.status(404).json({ message: 'Show not in your list' });
  }

  res.json({ item });
});

// PUT /api/shows/:tmdbId/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, isFavorite, userRating, notes } = req.body;
  const updateData = {};

  if (status) updateData.status = status;
  if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
  if (userRating !== undefined) updateData.userRating = userRating;
  if (notes !== undefined) updateData.notes = notes;
  if (status === 'completed') updateData.completedAt = new Date();

  const item = await WatchlistItem.findOneAndUpdate(
    { userId: req.user._id, tmdbShowId: parseInt(req.params.tmdbId) },
    { $set: updateData },
    { new: true }
  );

  if (!item) return res.status(404).json({ message: 'Show not found' });
  res.json({ item });
});

// DELETE /api/shows/:tmdbId
const removeShow = asyncHandler(async (req, res) => {
  const tmdbShowId = parseInt(req.params.tmdbId);

  await Promise.all([
    WatchlistItem.findOneAndDelete({ userId: req.user._id, tmdbShowId }),
    WatchedEpisode.deleteMany({ userId: req.user._id, tmdbShowId }),
  ]);

  res.json({ message: 'Show removed from watchlist' });
});

// GET /api/shows/:tmdbId/progress
const getProgress = asyncHandler(async (req, res) => {
  const tmdbShowId = parseInt(req.params.tmdbId);
  const watched = await WatchedEpisode.find({
    userId: req.user._id,
    tmdbShowId,
  }).select('season episode rewatchCount watchedAt');

  // Create a lookup Set for quick checking: "S1E3" format
  const watchedSet = watched.reduce((acc, ep) => {
    acc[`${ep.season}-${ep.episode}`] = {
      rewatchCount: ep.rewatchCount,
      watchedAt: ep.watchedAt,
    };
    return acc;
  }, {});

  res.json({ watchedCount: watched.length, watchedSet });
});

module.exports = { addShow, getWatchlist, getShow, updateStatus, removeShow, getProgress };
