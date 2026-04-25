const router = require('express').Router();
const { upload: uploadCtrl, getFeed, search, getOne, remove, myImages } = require('../controllers/imageController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getFeed);
router.get('/search', search);
router.get('/mine', authenticate, requireRole('creator'), myImages);
router.get('/:id', optionalAuth, getOne);
router.post('/', authenticate, requireRole('creator'), upload.single('image'), uploadCtrl);
router.delete('/:id', authenticate, requireRole('creator'), remove);

module.exports = router;
