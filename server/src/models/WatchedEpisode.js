const mongoose = require('mongoose');

const watchedEpisodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tmdbShowId: {
      type: Number,
      required: true,
      index: true,
    },
    season: {
      type: Number,
      required: true,
    },
    episode: {
      type: Number,
      required: true,
    },
    // Cached episode info for stats
    episodeName: { type: String, default: null },
    runtime: { type: Number, default: 0 }, // in minutes
    airDate: { type: String, default: null },

    rewatchCount: { type: Number, default: 0 },
    watchedAt: { type: Date, default: Date.now },
    lastRewatchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound unique index: one record per user per episode per show
watchedEpisodeSchema.index(
  { userId: 1, tmdbShowId: 1, season: 1, episode: 1 },
  { unique: true }
);

// Index for stats queries (streak calculation by date)
watchedEpisodeSchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('WatchedEpisode', watchedEpisodeSchema);
