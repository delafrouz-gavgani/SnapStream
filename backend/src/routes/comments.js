const router = require('express').Router({ mergeParams: true });
const { addComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.post('/', authenticate, requireRole('consumer'), addComment);

module.exports = router;
