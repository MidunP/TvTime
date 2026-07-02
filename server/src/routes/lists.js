const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getLists, createList, updateList, deleteList,
  addShowToList, removeShowFromList, reorderShows,
} = require('../controllers/listController');

router.use(protect);

router.get('/', getLists);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);
router.post('/:id/shows', addShowToList);
router.delete('/:id/shows/:tmdbId', removeShowFromList);
router.put('/:id/reorder', reorderShows);

module.exports = router;
