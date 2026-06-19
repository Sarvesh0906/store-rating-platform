const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const {
  createUserSchema,
  createStoreSchema,
  adminListQuerySchema,
} = require('../validators/adminValidators');
const {
  getDashboardMetrics,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetail,
} = require('../services/adminService');

const dashboardController = asyncHandler(async (_req, res) => {
  const metrics = await getDashboardMetrics();

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

const createUserController = asyncHandler(async (req, res) => {
  const payload = createUserSchema.parse(req.body);
  const user = await createUser(payload);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user },
  });
});

const createStoreController = asyncHandler(async (req, res) => {
  const payload = createStoreSchema.parse(req.body);
  const store = await createStore(payload);

  res.status(201).json({
    success: true,
    message: 'Store created successfully',
    data: { store },
  });
});

const listUsersController = asyncHandler(async (req, res) => {
  const query = adminListQuerySchema.parse(req.query);
  const result = await listUsers(query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const listStoresController = asyncHandler(async (req, res) => {
  const query = adminListQuerySchema.parse(req.query);
  const result = await listStores(query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const userDetailController = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'Invalid user id');
  }

  const result = await getUserDetail(userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  dashboardController,
  createUserController,
  createStoreController,
  listUsersController,
  listStoresController,
  userDetailController,
};
