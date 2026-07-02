const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { search, getShow, getSeason, getTrending, getPopular } = require('../controllers/tmdbController');

router.use(protect);

router.get('/search', search);
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/show/:id', getShow);
router.get('/show/:id/season/:n', getSeason);

module.exports = router;
