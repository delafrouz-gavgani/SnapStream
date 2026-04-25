const router = require('express').Router({ mergeParams: true });
const { upsertRating } = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.post('/', authenticate, requireRole('consumer'), upsertRating);

module.exports = router;
