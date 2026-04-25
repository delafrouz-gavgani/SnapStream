const router = require('express').Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const { toggleFollow, getFollowStatus } = require('../controllers/followController');
router.get('/',  authenticate, getFollowStatus);
router.post('/', authenticate, toggleFollow);
module.exports = router;
