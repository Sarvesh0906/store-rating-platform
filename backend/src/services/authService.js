const ApiError = require('../utils/apiError');
const { pool } = require('../config/db');
const { hashPassword, comparePasswords } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { findUserByEmail, findUserById, mapUser } = require('./userService');
const { mapDbError } = require('../utils/dbErrorMapper');

async function signup({ name, email, password, address }) {
  const normalizedEmail = email.trim().toLowerCase();
  console.info('[Signup Debug] Before duplicate check', {
    email: normalizedEmail,
    nameLength: name.trim().length,
    addressLength: address.trim().length,
  });
  console.info('[DB] Fetching user by email', { email: email.trim().toLowerCase() });
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new ApiError(409, 'A user with that email already exists');
  }

  const passwordHash = await hashPassword(password);
  console.info('[AUTH] Signup password hashed', { email: email.trim().toLowerCase() });
  console.info('[Signup Debug] Before DB insert', {
    email: normalizedEmail,
    role: 'NORMAL_USER',
  });

  let result;

  try {
    result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'NORMAL_USER')
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name.trim(), normalizedEmail, passwordHash, address.trim()],
    );
  } catch (error) {
    const mappedError = mapDbError(error);

    console.error('[Signup Debug] DB error', {
      code: error.code,
      constraint: error.constraint,
      detail: error.detail,
      message: error.message,
    });

    if (mappedError) {
      throw mappedError;
    }

    throw error;
  }

  const user = mapUser(result.rows[0]);
  const token = signAccessToken({
    sub: String(user.id),
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return {
    user,
    token,
  };
}

async function login({ email, password }) {
  console.info('[AUTH] Loading user for login', { email: email.trim().toLowerCase() });
  console.info('[DB] Fetching user by email', { email: email.trim().toLowerCase() });
  const userWithPassword = await findUserByEmail(email.trim().toLowerCase());

  if (!userWithPassword) {
    console.info('[LOGIN] User not found', { email: email.trim().toLowerCase() });
    throw new ApiError(401, 'Invalid email or password');
  }

  console.info('[LOGIN] User found', { userId: userWithPassword.id, role: userWithPassword.role });
  const passwordMatches = await comparePasswords(password, userWithPassword.password_hash);
  console.info('[AUTH] Password match result', { userId: userWithPassword.id, matched: passwordMatches });

  if (!passwordMatches) {
    console.info('[LOGIN] Login failed → reason', { email: email.trim().toLowerCase(), reason: 'Password mismatch' });
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = await findUserById(userWithPassword.id);
  const token = signAccessToken({
    sub: String(user.id),
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return {
    user,
    token,
  };
}

async function changePassword({ userId, currentPassword, newPassword }) {
  console.info('[AUTH] Change password request', { userId });
  const result = await pool.query(
    `SELECT id, password_hash, name, email, address, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const currentPasswordMatches = await comparePasswords(currentPassword, user.password_hash);

  if (!currentPasswordMatches) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const nextPasswordHash = await hashPassword(newPassword);

  const updatedUserResult = await pool.query(
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2
     RETURNING id, name, email, address, role, created_at, updated_at`,
    [nextPasswordHash, userId],
  );

  const updatedUser = mapUser(updatedUserResult.rows[0]);
  const token = signAccessToken({
    sub: String(updatedUser.id),
    role: updatedUser.role,
    email: updatedUser.email,
    name: updatedUser.name,
  });

  return {
    user: updatedUser,
    token,
  };
}

module.exports = {
  signup,
  login,
  changePassword,
};
