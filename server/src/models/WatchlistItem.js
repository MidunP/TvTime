const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
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
    },
    // Cached minimal TMDb data to avoid repeated API calls for list views
    showTitle: { type: String, required: true },
    showPoster: { type: String, default: null },
    showBackdrop: { type: String, default: null },
    showYear: { type: String, default: null },
    totalEpisodes: { type: Number, default: 0 },
    totalSeasons: { type: Number, default: 0 },
    genres: [{ type: String }],
    networks: [{ type: String }],

    // User tracking data
    status: {
      type: String,
      enum: ['watching', 'watchlist', 'completed', 'dropped', 'paused'],
      default: 'watchlist',
    },
    isFavorite: { type: Boolean, default: false },
    userRating: { type: Number, min: 1, max: 10, default: null },
    notes: { type: String, default: null },

    // Progress tracking
    watchedEpisodesCount: { type: Number, default: 0 },
    currentSeason: { type: Number, default: 1 },
    currentEpisode: { type: Number, default: 1 },

    // Timestamps
    addedAt: { type: Date, default: Date.now },
    lastWatchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound unique index: one entry per user per show
watchlistItemSchema.index({ userId: 1, tmdbShowId: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
