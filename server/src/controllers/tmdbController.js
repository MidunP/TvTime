const tmdbService = require('../services/tmdbService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/tmdb/search?q=&page=
const search = asyncHandler(async (req, res) => {
  const { q, page } = req.query;
  if (!q) return res.status(400).json({ message: 'Search query required' });
  const data = await tmdbService.searchShows(q, page || 1);
  res.json(data);
});

// GET /api/tmdb/show/:id
const getShow = asyncHandler(async (req, res) => {
  const data = await tmdbService.getShow(req.params.id);
  res.json(data);
});

// GET /api/tmdb/show/:id/season/:n
const getSeason = asyncHandler(async (req, res) => {
  const { id, n } = req.params;
  const data = await tmdbService.getSeason(id, n);
  res.json(data);
});

// GET /api/tmdb/trending
const getTrending = asyncHandler(async (req, res) => {
  const data = await tmdbService.getTrending();
  res.json(data);
});

// GET /api/tmdb/popular?page=
const getPopular = asyncHandler(async (req, res) => {
  const data = await tmdbService.getPopular(req.query.page || 1);
  res.json(data);
});

module.exports = { search, getShow, getSeason, getTrending, getPopular };
