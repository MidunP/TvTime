const router = require('express').Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createListSchema, updateListSchema, addShowToListSchema, reorderShowsSchema,
} = require('../validators/listValidators');
const {
  getLists, createList, updateList, deleteList,
  addShowToList, removeShowFromList, reorderShows,
} = require('../controllers/listController');

router.use(protect);

router.get('/', getLists);
router.post('/', validate(createListSchema), createList);
router.put('/:id', validate(updateListSchema), updateList);
router.delete('/:id', deleteList);
router.post('/:id/shows', validate(addShowToListSchema), addShowToList);
router.delete('/:id/shows/:tmdbId', removeShowFromList);
router.put('/:id/reorder', validate(reorderShowsSchema), reorderShows);

module.exports = router;
