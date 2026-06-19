const ApiError = require('../utils/apiError');
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { mapUser } = require('./userService');
const { createPaginationMeta } = require('../utils/pagination');

const userSortColumns = new Set(['name', 'email', 'address', 'role', 'created_at', 'updated_at']);
const storeSortColumns = new Set(['name', 'email', 'address', 'overall_rating', 'rating_count', 'created_at', 'updated_at']);

function normalizeSort(sortBy, sortOrder, allowedColumns, fallbackColumn = 'created_at') {
  const column = allowedColumns.has(sortBy) ? sortBy : fallbackColumn;
  const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return { column, direction };
}

function getUserSelectAlias(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseOptionalOwnerId(ownerUserId) {
  if (ownerUserId === undefined || ownerUserId === null || ownerUserId === '') {
    return null;
  }

  const parsed = Number(ownerUserId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, 'owner_user_id must be a positive integer');
  }

  return parsed;
}

async function getDashboardMetrics() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM stores) AS total_stores,
      (SELECT COUNT(*)::int FROM ratings) AS total_ratings
  `);

  return result.rows[0];
}

async function createUser({ name, email, password, address, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

  if (existingUser.rowCount > 0) {
    throw new ApiError(409, 'A user with that email already exists');
  }

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at, updated_at`,
    [name.trim(), normalizedEmail, passwordHash, address.trim(), role],
  );

  return mapUser(result.rows[0]);
}

async function createStore({ name, email, address, owner_user_id: ownerUserId }) {
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const ownerUserIdValue = parseOptionalOwnerId(ownerUserId);

  if (ownerUserIdValue) {
    const ownerResult = await pool.query('SELECT id, role FROM users WHERE id = $1 LIMIT 1', [ownerUserIdValue]);

    if (ownerResult.rowCount === 0) {
      throw new ApiError(404, 'Owner user not found');
    }

    if (ownerResult.rows[0].role !== 'STORE_OWNER') {
      throw new ApiError(400, 'Selected owner must have the STORE_OWNER role');
    }
  }

  const result = await pool.query(
    `INSERT INTO stores (name, email, address, owner_user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_user_id, created_at, updated_at`,
    [name.trim(), normalizedEmail, address.trim(), ownerUserIdValue],
  );

  return result.rows[0];
}

async function listUsers({ page, limit, search, role, sortBy, sortOrder }) {
  const offset = (page - 1) * limit;
  const { column, direction } = normalizeSort(sortBy, sortOrder, userSortColumns);
  const values = [['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']];
  const conditions = [`role = ANY($1::user_role[])`];

  if (search) {
    values.push(`%${search}%`);
    const searchParam = `$${values.length}`;
    conditions.push(`(name ILIKE ${searchParam} OR email ILIKE ${searchParam} OR address ILIKE ${searchParam} OR role::text ILIKE ${searchParam})`);
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, values);

  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const result = await pool.query(
    `SELECT id, name, email, address, role, created_at, updated_at
     FROM users
     ${whereClause}
     ORDER BY ${column} ${direction}
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values,
  );

  return {
    items: result.rows.map(getUserSelectAlias),
    pagination: createPaginationMeta({ page, limit, total: countResult.rows[0].total }),
  };
}

async function listStores({ page, limit, search, sortBy, sortOrder }) {
  const offset = (page - 1) * limit;
  const { column, direction } = normalizeSort(sortBy, sortOrder, storeSortColumns);
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    const searchParam = `$${values.length}`;
    conditions.push(`(s.name ILIKE ${searchParam} OR s.email ILIKE ${searchParam} OR s.address ILIKE ${searchParam})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM stores s
     ${whereClause}`,
    values,
  );

  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_user_id,
       s.created_at,
       s.updated_at,
       COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ORDER BY ${column === 'overall_rating' || column === 'rating_count' ? column : `s.${column}`} ${direction}
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values,
  );

  return {
    items: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      owner_user_id: row.owner_user_id,
      overall_rating: Number(row.overall_rating),
      rating_count: Number(row.rating_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    pagination: createPaginationMeta({ page, limit, total: countResult.rows[0].total }),
  };
}

async function getUserDetail(userId) {
  const userResult = await pool.query(
    `SELECT id, name, email, address, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  if (userResult.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  const user = getUserSelectAlias(userResult.rows[0]);
  const ownedStoreResult = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_user_id,
       COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_user_id = $1
     GROUP BY s.id
     LIMIT 1`,
    [userId],
  );

  const ownedStore = ownedStoreResult.rows[0]
    ? {
        id: ownedStoreResult.rows[0].id,
        name: ownedStoreResult.rows[0].name,
        email: ownedStoreResult.rows[0].email,
        address: ownedStoreResult.rows[0].address,
        owner_user_id: ownedStoreResult.rows[0].owner_user_id,
        overall_rating: Number(ownedStoreResult.rows[0].overall_rating),
        rating_count: Number(ownedStoreResult.rows[0].rating_count),
      }
    : null;

  return {
    user,
    owned_store: ownedStore,
  };
}

module.exports = {
  getDashboardMetrics,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetail,
};
