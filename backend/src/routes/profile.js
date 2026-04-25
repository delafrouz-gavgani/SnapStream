const router = require('express').Router();
const { getProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getProfile);

module.exports = router;
