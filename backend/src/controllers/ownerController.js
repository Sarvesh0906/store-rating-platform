const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { ownerDashboardQuerySchema } = require('../validators/storeValidators');
const { getOwnerDashboard } = require('../services/ownerService');

const ownerDashboardController = asyncHandler(async (req, res) => {
  const userId = Number(req.user?.sub);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const query = ownerDashboardQuerySchema.parse(req.query);
  const data = await getOwnerDashboard({ userId, ...query });

  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  ownerDashboardController,
};
