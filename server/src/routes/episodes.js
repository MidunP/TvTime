const router = require('express').Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { markWatchedSchema, markUnwatchedSchema, markRewatchedSchema } = require('../validators/episodeValidators');
const {
  markWatched, markUnwatched, markRewatched, getRecentlyWatched,
} = require('../controllers/episodeController');

router.use(protect);

router.post('/watch', validate(markWatchedSchema), markWatched);
router.delete('/unwatch', validate(markUnwatchedSchema), markUnwatched);
router.post('/rewatch', validate(markRewatchedSchema), markRewatched);
router.get('/recent', getRecentlyWatched);

module.exports = router;
