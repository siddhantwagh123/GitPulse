const express = require('express');
const router = express.Router();
const { getFromCache, saveToCache } = require('../services/cacheService');
const { getUserAnalytics } = require('../services/githubService');
const { rateLimiter } = require('../services/rateLimiter');

// GET limit status for the client IP without consuming attempts
router.get('/limit-status', rateLimiter);

// POST analyze username, rate limited
router.post('/', rateLimiter, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ success: false, error: 'Username is required and must be a string' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Basic GitHub username validation
    const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    if (!githubUsernameRegex.test(cleanUsername)) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub username format' });
    }

    // 1. Check cache first
    const cachedData = await getFromCache(cleanUsername);
    if (cachedData) {
      // Remove mongodb internal fields before sending
      const { _id, expires_at, ...cleanCached } = cachedData;
      return res.json({
        success: true,
        data: cleanCached,
        cached: true,
        rateLimit: req.rateLimit
      });
    }

    // 2. Fetch fresh data
    const freshData = await getUserAnalytics(cleanUsername);

    // 3. Cache the results
    await saveToCache(cleanUsername, freshData);

    res.json({
      success: true,
      data: freshData,
      cached: false,
      rateLimit: req.rateLimit
    });
  } catch (error) {
    console.error('API Error details:', error);
    
    let statusCode = 500;
    let message = 'An error occurred while fetching developer data';

    if (error.message === 'User not found') {
      statusCode = 404;
      message = 'GitHub user not found. Please check the spelling.';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      message = 'GitHub API rate limit exceeded. Please try again later.';
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      details: error.message
    });
  }
});

module.exports = router;
