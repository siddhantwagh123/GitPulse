const rateLimitStore = {};

function rateLimiter(req, res, next) {
  // Extract clean client IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute sliding window
  const maxAttempts = 5; // 5 search attempts per minute

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      attempts: 0,
      resetTime: now + windowMs
    };
  }

  const clientLimit = rateLimitStore[ip];

  // If rate limit window has expired, reset the window
  if (now > clientLimit.resetTime) {
    clientLimit.attempts = 0;
    clientLimit.resetTime = now + windowMs;
  }

  // Set standard rate limit headers on response
  res.setHeader('X-RateLimit-Limit', maxAttempts);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - clientLimit.attempts));
  res.setHeader('X-RateLimit-Reset', Math.ceil(clientLimit.resetTime / 1000));

  // If this is a status check (GET request), return info without consuming an attempt
  if (req.method === 'GET') {
    return res.json({
      success: true,
      limit: maxAttempts,
      remaining: Math.max(0, maxAttempts - clientLimit.attempts),
      resetInSec: Math.max(0, Math.ceil((clientLimit.resetTime - now) / 1000))
    });
  }

  // If limit exceeded, return HTTP 429 Too Many Requests
  if (clientLimit.attempts >= maxAttempts) {
    res.setHeader('Retry-After', Math.ceil((clientLimit.resetTime - now) / 1000));
    return res.status(429).json({
      success: false,
      error: 'Search limit reached. Please wait for the cooldown timer.',
      remaining: 0,
      resetInSec: Math.max(0, Math.ceil((clientLimit.resetTime - now) / 1000))
    });
  }

  // Increment attempts on POST request search
  clientLimit.attempts += 1;
  
  // Update header to match incremented value
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - clientLimit.attempts));

  // Attach rate limit info to request object
  req.rateLimit = {
    limit: maxAttempts,
    remaining: maxAttempts - clientLimit.attempts,
    resetInSec: Math.max(0, Math.ceil((clientLimit.resetTime - now) / 1000))
  };

  next();
}

module.exports = { rateLimiter };
