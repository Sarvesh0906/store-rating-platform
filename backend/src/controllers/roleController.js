const asyncHandler = require('../utils/asyncHandler');

const accessController = (roleName) =>
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: `${roleName} access granted`,
    });
  });

module.exports = {
  accessController,
};
