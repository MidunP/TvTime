const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFeed,
} = require('../controllers/socialController');

router.post('/follow/:userId', protect, followUser);
router.delete('/unfollow/:userId', protect, unfollowUser);
router.get('/followers/:userId', protect, getFollowers);
router.get('/following/:userId', protect, getFollowing);
router.get('/feed', protect, getFeed);

module.exports = router;
