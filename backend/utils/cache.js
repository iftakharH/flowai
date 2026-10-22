// Small in-process TTL cache. One instance is enough for the current single
// Node process; move this to Redis when the API runs on more than one instance.
const store = new Map();
const MAX_ENTRIES = 5000;

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

const set = (key, value, ttlMs = 30000) => {
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

const del = (key) => store.delete(key);

const clearUser = (userId) => {
  const prefix = `user:${userId}:`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

module.exports = { get, set, del, clearUser };
