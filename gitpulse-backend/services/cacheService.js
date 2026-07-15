const { getDatabase } = require('./db');

// In-memory cache fallback to store analytics data when MongoDB is offline
const inMemoryCache = new Map();
let indexCreated = false;

async function ensureIndexes() {
  if (indexCreated) return;
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('github_cache').createIndex(
        { expires_at: 1 },
        { expireAfterSeconds: 0 }
      );
      indexCreated = true;
      console.log('[Database] MongoDB TTL cache index ensured.');
    }
  } catch (error) {
    // Silent catch - we will fallback to in-memory
  }
}

async function getFromCache(username) {
  const cleanUsername = username.toLowerCase().trim();

  // 1. Try to read from MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      await ensureIndexes();
      const cache = await db.collection('github_cache').findOne({ username: cleanUsername });
      
      if (cache && new Date(cache.expires_at) > new Date()) {
        console.log('[Cache] MongoDB hit for:', cleanUsername);
        return cache;
      }
    }
  } catch (error) {
    // Silent fallback to in-memory to avoid console spamming
  }

  // 2. Fallback to In-Memory Cache
  const memCache = inMemoryCache.get(cleanUsername);
  if (memCache && new Date(memCache.expires_at) > new Date()) {
    console.log('[Cache] In-Memory hit for:', cleanUsername);
    return memCache;
  }

  return null;
}

async function saveToCache(username, data) {
  const cleanUsername = username.toLowerCase().trim();
  const expires_at = new Date(Date.now() + 600000); // 10 minutes expiration
  
  const cachePayload = {
    ...data,
    username: cleanUsername,
    last_updated: new Date(),
    expires_at: expires_at
  };

  // 1. Try to save to MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      await ensureIndexes();
      await db.collection('github_cache').updateOne(
        { username: cleanUsername },
        { $set: cachePayload },
        { upsert: true }
      );
      console.log('[Cache] Saved successfully to MongoDB for:', cleanUsername);
      return;
    }
  } catch (error) {
    // Silent fallback to in-memory
  }

  // 2. Fallback to In-Memory Cache
  inMemoryCache.set(cleanUsername, cachePayload);
  console.log('[Cache] Saved to In-Memory for:', cleanUsername);
}

module.exports = { getFromCache, saveToCache };
