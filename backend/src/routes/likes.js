const router = require('express').Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const { toggleLike } = require('../controllers/likeController');
router.post('/', authenticate, toggleLike);
module.exports = router;
