const ApiError = require('../utils/apiError');
const { pool } = require('../config/db');
const { createPaginationMeta } = require('../utils/pagination');

const ownerRatingSortColumns = new Set(['name', 'email', 'address', 'rating_value', 'created_at']);

function normalizeSort(sortBy, sortOrder) {
  const column = ownerRatingSortColumns.has(sortBy) ? sortBy : 'created_at';
  const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return { column, direction };
}

async function getOwnerDashboard({ userId, page, limit, search, sortBy, sortOrder }) {
  const storeResult = await pool.query(
    `SELECT
       s.id AS store_id,
       s.name AS store_name,
       COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0) AS average_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_user_id = $1
     GROUP BY s.id
     LIMIT 1`,
    [userId],
  );

  if (storeResult.rowCount === 0) {
    return {
      store: null,
      ratings: [],
    };
  }

  const store = storeResult.rows[0];

  const { column, direction } = normalizeSort(sortBy, sortOrder);
  const values = [store.store_id];
  const conditions = [];
  const countValues = [store.store_id];
  const countConditions = [];

  if (search) {
    values.push(`%${search}%`);
    const searchParam = `$${values.length}`;
    conditions.push(`(u.name ILIKE ${searchParam} OR u.email ILIKE ${searchParam} OR u.address ILIKE ${searchParam})`);

    countValues.push(`%${search}%`);
    const countSearchParam = `$${countValues.length}`;
    countConditions.push(`(u.name ILIKE ${countSearchParam} OR u.email ILIKE ${countSearchParam} OR u.address ILIKE ${countSearchParam})`);
  }

  const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : '';
  const countWhereClause = countConditions.length ? `AND ${countConditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM ratings r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ${countWhereClause}`,
    countValues,
  );

  const offset = (page - 1) * limit;
  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const ratingsResult = await pool.query(
    `SELECT
       u.id AS user_id,
       u.name,
       u.email,
       u.address,
       r.rating_value,
       r.created_at,
       r.updated_at
     FROM ratings r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ${whereClause}
     ORDER BY ${
       column === 'rating_value'
         ? 'r.rating_value'
         : column === 'created_at'
           ? 'r.created_at'
           : `u.${column}`
     } ${direction}, r.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values,
  );

  return {
    store: {
      id: store.store_id,
      name: store.store_name,
      average_rating: Number(store.average_rating),
    },
    ratings: ratingsResult.rows.map((row) => ({
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      address: row.address,
      rating_value: row.rating_value,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    pagination: createPaginationMeta({ page, limit, total: countResult.rows[0].total }),
  };
}

module.exports = {
  getOwnerDashboard,
};
