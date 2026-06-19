const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { storeListQuerySchema, ratingSchema } = require('../validators/storeValidators');
const {
  listStoresForUser,
  getStoreForUser,
  createRating,
  updateRating,
} = require('../services/storeService');

const listStoresController = asyncHandler(async (req, res) => {
  const query = storeListQuerySchema.parse(req.query);
  const userId = Number(req.user?.sub);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const result = await listStoresForUser({
    userId,
    ...query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getStoreController = asyncHandler(async (req, res) => {
  const userId = Number(req.user?.sub);
  const storeId = Number(req.params.storeId);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!Number.isInteger(storeId) || storeId <= 0) {
    throw new ApiError(400, 'Invalid store id');
  }

  const store = await getStoreForUser({ userId, storeId });

  res.status(200).json({
    success: true,
    data: { store },
  });
});

const createRatingController = asyncHandler(async (req, res) => {
  const userId = Number(req.user?.sub);
  const storeId = Number(req.params.storeId);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!Number.isInteger(storeId) || storeId <= 0) {
    throw new ApiError(400, 'Invalid store id');
  }

  const payload = ratingSchema.parse(req.body);
  const rating = await createRating({
    userId,
    storeId,
    ratingValue: payload.rating_value,
  });

  res.status(201).json({
    success: true,
    message: 'Rating submitted successfully',
    data: { rating },
  });
});

const updateRatingController = asyncHandler(async (req, res) => {
  const userId = Number(req.user?.sub);
  const storeId = Number(req.params.storeId);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!Number.isInteger(storeId) || storeId <= 0) {
    throw new ApiError(400, 'Invalid store id');
  }

  const payload = ratingSchema.parse(req.body);
  const rating = await updateRating({
    userId,
    storeId,
    ratingValue: payload.rating_value,
  });

  res.status(200).json({
    success: true,
    message: 'Rating updated successfully',
    data: { rating },
  });
});

module.exports = {
  listStoresController,
  getStoreController,
  createRatingController,
  updateRatingController,
};
