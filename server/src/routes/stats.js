const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getStats } = require('../controllers/statsController');

router.use(protect);
router.get('/', getStats);

module.exports = router;
