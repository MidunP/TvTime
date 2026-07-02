const mongoose = require('mongoose');

const customListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    emoji: {
      type: String,
      default: '📺',
    },
    description: {
      type: String,
      default: null,
      maxlength: 200,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    // Array of TMDb show IDs in user-defined order
    showIds: [{ type: Number }],
    // Cached poster URLs for collage display (first 4 shows)
    posterCache: [{ type: String }],
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomList', customListSchema);
