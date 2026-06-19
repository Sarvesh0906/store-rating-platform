const ApiError = require('../utils/apiError');
const { mapDbError } = require('../utils/dbErrorMapper');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: (error.issues || error.errors || []).map((item) => ({
        path: item.path.join('.'),
        message: item.message,
      })),
    });
  }

  const mappedDbError = mapDbError(error);
  if (mappedDbError) {
    return res.status(mappedDbError.statusCode).json({
      success: false,
      message: mappedDbError.message,
      ...(mappedDbError.details ? { details: mappedDbError.details } : {}),
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Request failed',
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (statusCode >= 500) {
    console.error('Unhandled server error', error);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : error.message || 'Request failed',
    ...(error.details ? { details: error.details } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};
