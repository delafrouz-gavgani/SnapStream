const cache = new Map();
const TTL = 60 * 1000; // 1 minute

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + TTL });
}

function invalidate(pattern) {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}

module.exports = { get, set, invalidate };
