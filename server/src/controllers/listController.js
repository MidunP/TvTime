const CustomList = require('../models/CustomList');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/lists
const getLists = asyncHandler(async (req, res) => {
  const lists = await CustomList.find({ userId: req.user._id }).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ lists });
});

// POST /api/lists
const createList = asyncHandler(async (req, res) => {
  const { name, emoji, description, isPrivate } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('List name is required');
  }

  const list = await CustomList.create({
    userId: req.user._id,
    name: name.trim(),
    emoji: emoji || '📺',
    description,
    isPrivate: isPrivate || false,
  });

  res.status(201).json({ list });
});

// PUT /api/lists/:id
const updateList = asyncHandler(async (req, res) => {
  const { name, emoji, description, isPrivate, sortOrder } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (emoji !== undefined) updateData.emoji = emoji;
  if (description !== undefined) updateData.description = description;
  if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  const list = await CustomList.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updateData },
    { new: true }
  );

  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ list });
});

// DELETE /api/lists/:id
const deleteList = asyncHandler(async (req, res) => {
  const list = await CustomList.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ message: 'List deleted' });
});

// POST /api/lists/:id/shows
const addShowToList = asyncHandler(async (req, res) => {
  const { tmdbShowId, posterUrl } = req.body;

  const list = await CustomList.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    {
      $addToSet: { showIds: tmdbShowId },
    },
    { new: true }
  );

  if (!list) return res.status(404).json({ message: 'List not found' });

  // Update poster cache (first 4 posters)
  if (posterUrl && list.posterCache.length < 4) {
    list.posterCache.push(posterUrl);
    await list.save();
  }

  res.json({ list });
});

// DELETE /api/lists/:id/shows/:tmdbId
const removeShowFromList = asyncHandler(async (req, res) => {
  const list = await CustomList.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $pull: { showIds: parseInt(req.params.tmdbId) } },
    { new: true }
  );

  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ list });
});

// PUT /api/lists/:id/reorder — reorder shows within a list
const reorderShows = asyncHandler(async (req, res) => {
  const { showIds } = req.body; // Full ordered array
  const list = await CustomList.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { showIds } },
    { new: true }
  );

  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ list });
});

module.exports = { getLists, createList, updateList, deleteList, addShowToList, removeShowFromList, reorderShows };
