const ApiError = require('../utils/apiError');

function createRateLimit({ windowMs, max, message }) {
  const buckets = new Map();

  return (req, _res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      return next(new ApiError(429, message || 'Too many requests, please try again later'));
    }

    return next();
  };
}

module.exports = {
  createRateLimit,
};
