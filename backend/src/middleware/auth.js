const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/jwt');

function getBearerToken(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

function authenticateUser(req, _res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = {
  authenticateUser,
  authenticate: authenticateUser,
};
