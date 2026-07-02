const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  markWatched, markUnwatched, markRewatched, getRecentlyWatched,
} = require('../controllers/episodeController');

router.use(protect);

router.post('/watch', markWatched);
router.delete('/unwatch', markUnwatched);
router.post('/rewatch', markRewatched);
router.get('/recent', getRecentlyWatched);

module.exports = router;
