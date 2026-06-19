const asyncHandler = require('../utils/asyncHandler');
const { checkDatabaseConnection } = require('../config/db');

const healthController = asyncHandler(async (_req, res) => {
  let dbStatus = 'unavailable';

  try {
    const connected = await checkDatabaseConnection();
    dbStatus = connected ? 'connected' : 'unavailable';
  } catch (error) {
    dbStatus = 'unavailable';
  }

  res.status(200).json({
    success: true,
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  healthController,
};
