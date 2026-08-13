const Follow = require('../models/Follow');
const ActivityFeed = require('../models/ActivityFeed');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const cacheService = require('../services/cacheService');

// POST /api/social/follow/:userId
const followUser = asyncHandler(async (req, res) => {
    const targetUserId = req.params.userId;
    if (targetUserId === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const existing = await Follow.findOne({
        followerId: req.user._id,
        followingId: targetUserId,
    });

    if (existing) {
        return res.status(409).json({ message: 'Already following this user' });
    }

    await Follow.create({
        followerId: req.user._id,
        followingId: targetUserId,
    });

    // Invalidate feed cache for user
    cacheService.del(`feed:${req.user._id}`);

    res.status(201).json({ message: `Now following ${targetUser.displayName || targetUser.username}` });
});

// DELETE /api/social/unfollow/:userId
const unfollowUser = asyncHandler(async (req, res) => {
    const targetUserId = req.params.userId;

    await Follow.findOneAndDelete({
        followerId: req.user._id,
        followingId: targetUserId,
    });

    cacheService.del(`feed:${req.user._id}`);

    res.json({ message: 'Unfollowed successfully' });
});

// GET /api/social/followers/:userId?page=1&limit=20
const getFollowers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
        Follow.find({ followingId: req.params.userId })
            .populate('followerId', 'username displayName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Follow.countDocuments({ followingId: req.params.userId }),
    ]);

    const followers = follows.map((f) => f.followerId);
    res.json({
        followers,
        count: total,
        page,
        totalPages: Math.ceil(total / limit),
    });
});

// GET /api/social/following/:userId?page=1&limit=20
const getFollowing = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
        Follow.find({ followerId: req.params.userId })
            .populate('followingId', 'username displayName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Follow.countDocuments({ followerId: req.params.userId }),
    ]);

    const following = follows.map((f) => f.followingId);
    res.json({
        following,
        count: total,
        page,
        totalPages: Math.ceil(total / limit),
    });
});

// GET /api/social/feed?page=1&limit=30
const getFeed = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
    const skip = (page - 1) * limit;

    const cacheKey = `feed:${req.user._id}:p${page}`;

    const result = await cacheService.getOrSet(cacheKey, async () => {
        // 1. Get users followed by req.user
        const following = await Follow.find({ followerId: req.user._id }).select('followingId');
        const followingUserIds = following.map((f) => f.followingId);

        // Include user's own activity + followed users' activity
        const userIds = [req.user._id, ...followingUserIds];

        // 2. Fetch paginated activities from ActivityFeed
        const [activities, total] = await Promise.all([
            ActivityFeed.find({ userId: { $in: userIds } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ActivityFeed.countDocuments({ userId: { $in: userIds } }),
        ]);

        return { activities, total };
    }, 60); // Cache for 60 seconds

    res.json({
        feed: result.activities,
        count: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
    });
});

// POST /api/social/activity — Record a user activity
const logActivity = async (userId, username, displayName, activityType, data = {}) => {
    try {
        const activity = await ActivityFeed.create({
            userId,
            username,
            displayName: displayName || username,
            activityType,
            tmdbShowId: data.tmdbShowId || null,
            showTitle: data.showTitle || null,
            showPoster: data.showPoster || null,
            season: data.season || null,
            episode: data.episode || null,
            episodeName: data.episodeName || null,
            details: data.details || '',
        });

        // Invalidate activity feed cache
        cacheService.del(`feed:${userId}`);
        return activity;
    } catch (err) {
        console.error('Error logging user activity:', err.message);
    }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing, getFeed, logActivity };
