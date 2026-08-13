const mongoose = require('mongoose');

const activityFeedSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            default: '',
        },
        activityType: {
            type: String,
            enum: ['watch_episode', 'add_show', 'complete_show', 'create_list', 'favorite_show'],
            required: true,
            index: true,
        },
        tmdbShowId: {
            type: Number,
            default: null,
        },
        showTitle: {
            type: String,
            default: null,
        },
        showPoster: {
            type: String,
            default: null,
        },
        season: {
            type: Number,
            default: null,
        },
        episode: {
            type: Number,
            default: null,
        },
        episodeName: {
            type: String,
            default: null,
        },
        details: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Index for retrieving feed by user and date
activityFeedSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityFeed', activityFeedSchema);
