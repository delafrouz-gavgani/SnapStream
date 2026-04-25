const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { toggleBookmark, getBookmarks } = require('../controllers/bookmarkController');
router.get('/',    authenticate, getBookmarks);
router.post('/:id', authenticate, toggleBookmark);
module.exports = router;
