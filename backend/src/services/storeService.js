const ApiError = require('../utils/apiError');
const { pool } = require('../config/db');
const { createPaginationMeta } = require('../utils/pagination');

const storeSortColumns = new Set(['name', 'address', 'overall_rating', 'created_at']);

function normalizeSort(sortBy, sortOrder) {
  const column = storeSortColumns.has(sortBy) ? sortBy : 'name';
  const direction = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { column, direction };
}

function mapStoreRow(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    overall_rating: Number(row.overall_rating),
    user_rating: row.user_rating === null || row.user_rating === undefined ? null : Number(row.user_rating),
    rating_count: Number(row.rating_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listStoresForUser({ userId, page, limit, search, sortBy, sortOrder }) {
  const offset = (page - 1) * limit;
  const { column, direction } = normalizeSort(sortBy, sortOrder);
  const values = [userId];
  const conditions = [];
  const countValues = [];
  const countConditions = [];

  if (search) {
    values.push(`%${search}%`);
    const searchParam = `$${values.length}`;
    conditions.push(`(s.name ILIKE ${searchParam} OR s.address ILIKE ${searchParam})`);

    countValues.push(`%${search}%`);
    const countSearchParam = `$${countValues.length}`;
    countConditions.push(`(s.name ILIKE ${countSearchParam} OR s.address ILIKE ${countSearchParam})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countWhereClause = countConditions.length ? `WHERE ${countConditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM stores s
    ${countWhereClause}
  `;

  const countResult = await pool.query(countQuery, countValues);

  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const sortExpression =
    column === 'overall_rating'
      ? 'overall_rating'
      : column === 'name'
        ? 's.name'
        : column === 'address'
          ? 's.address'
          : 's.created_at';

  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.address,
       s.created_at,
       s.updated_at,
       COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count,
       ur.rating_value AS user_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
     ${whereClause}
     GROUP BY s.id, ur.rating_value
     ORDER BY ${sortExpression} ${direction}
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values,
  );

  return {
    items: result.rows.map(mapStoreRow),
    pagination: createPaginationMeta({ page, limit, total: countResult.rows[0].total }),
  };
}

async function getStoreForUser({ userId, storeId }) {
  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.address,
       s.created_at,
       s.updated_at,
       COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count,
       ur.rating_value AS user_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
     WHERE s.id = $2
     GROUP BY s.id, ur.rating_value`,
    [userId, storeId],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  return mapStoreRow(result.rows[0]);
}

async function createRating({ userId, storeId, ratingValue }) {
  const storeResult = await pool.query('SELECT id FROM stores WHERE id = $1 LIMIT 1', [storeId]);
  if (storeResult.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  const existingResult = await pool.query(
    'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2 LIMIT 1',
    [userId, storeId],
  );

  if (existingResult.rowCount > 0) {
    throw new ApiError(409, 'You already submitted a rating for this store');
  }

  const result = await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating_value)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, store_id, rating_value, created_at, updated_at`,
    [userId, storeId, ratingValue],
  );

  return result.rows[0];
}

async function updateRating({ userId, storeId, ratingValue }) {
  const result = await pool.query(
    `UPDATE ratings
     SET rating_value = $3
     WHERE user_id = $1 AND store_id = $2
     RETURNING id, user_id, store_id, rating_value, created_at, updated_at`,
    [userId, storeId, ratingValue],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Rating not found for this store');
  }

  return result.rows[0];
}

module.exports = {
  listStoresForUser,
  getStoreForUser,
  createRating,
  updateRating,
};
