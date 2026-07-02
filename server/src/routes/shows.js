const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  addShow, getWatchlist, getShow, updateStatus, removeShow, getProgress,
} = require('../controllers/showController');

router.use(protect);

router.post('/add', addShow);
router.get('/watchlist', getWatchlist);
router.get('/:tmdbId', getShow);
router.put('/:tmdbId/status', updateStatus);
router.delete('/:tmdbId', removeShow);
router.get('/:tmdbId/progress', getProgress);

module.exports = router;
