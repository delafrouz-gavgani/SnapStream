require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`SnapStream API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[SnapStream] Port ${PORT} is already in use.\n`);
  } else {
    console.error('[SnapStream] Server error:', err.message);
  }
  process.exit(1);
});
