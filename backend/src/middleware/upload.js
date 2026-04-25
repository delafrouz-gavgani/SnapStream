const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi|mkv|m4v/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image and video files are allowed'));
};

// ---------------------------------------------------------------------------
// LOCAL storage (active) — saves files to the uploads/ directory on disk.
// ---------------------------------------------------------------------------
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => { require('fs').mkdirSync('uploads/', { recursive: true }); cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: localStorage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 10MB
});

// ---------------------------------------------------------------------------
// AZURE storage (commented — uncomment when Azure credentials are available).
// Uses memoryStorage so the buffer is available for streaming to Blob Storage.
// Switch the export below from `upload` to `uploadAzure` to activate.
// ---------------------------------------------------------------------------
// const uploadAzure = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

module.exports = upload;
// module.exports = uploadAzure; // <- swap to this line for Azure
