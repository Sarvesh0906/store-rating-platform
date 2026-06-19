const asyncHandler = require('../utils/asyncHandler');
const {
  signupSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validators/authValidators');
const { signup, login, changePassword } = require('../services/authService');
const { findUserById } = require('../services/userService');
const ApiError = require('../utils/apiError');

const signupController = asyncHandler(async (req, res) => {
  console.info('[Signup Debug] Incoming payload', {
    nameLength: String(req.body?.name || '').trim().length,
    email: String(req.body?.email || '').trim().toLowerCase(),
    addressLength: String(req.body?.address || '').trim().length,
    hasPassword: Boolean(req.body?.password),
  });

  const payload = signupSchema.parse(req.body);
  console.info('[Signup Debug] Validation result', {
    valid: true,
    email: payload.email.trim().toLowerCase(),
    nameLength: payload.name.trim().length,
    addressLength: payload.address.trim().length,
  });
  const result = await signup(payload);
  console.info('[SIGNUP] User created successfully', {
    userId: result.user?.id,
    role: result.user?.role,
  });

  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: result,
  });
});

const loginController = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  console.info('[LOGIN] Incoming login request', { email: payload.email.trim().toLowerCase() });
  let result;

  try {
    result = await login(payload);
  } catch (error) {
    console.info('[LOGIN] Login failed -> reason', {
      email: payload.email.trim().toLowerCase(),
      reason: error.message,
    });
    throw error;
  }

  console.info('[LOGIN] Login success -> sending response', {
    userId: result.user?.id,
    role: result.user?.role,
  });
  console.info('[LOGIN] Response payload being sent', {
    success: true,
    message: 'Login successful',
    userId: result.user?.id,
    role: result.user?.role,
    hasToken: Boolean(result.token),
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

const logoutController = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

const meController = asyncHandler(async (req, res) => {
  const userId = Number(req.user?.sub);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

const changePasswordController = asyncHandler(async (req, res) => {
  const payload = changePasswordSchema.parse(req.body);
  const userId = Number(req.user?.sub);

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const result = await changePassword({
    userId,
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: result,
  });
});

module.exports = {
  signupController,
  loginController,
  logoutController,
  meController,
  changePasswordController,
};
