const router = require('express').Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addShowSchema, updateStatusSchema } = require('../validators/showValidators');
const {
  addShow, getWatchlist, getShow, updateStatus, removeShow, getProgress,
} = require('../controllers/showController');

router.use(protect);

router.post('/add', validate(addShowSchema), addShow);
router.get('/watchlist', getWatchlist);
router.get('/:tmdbId', getShow);
router.put('/:tmdbId/status', validate(updateStatusSchema), updateStatus);
router.delete('/:tmdbId', removeShow);
router.get('/:tmdbId/progress', getProgress);

module.exports = router;
