const { pool } = require('../config/db');

function mapUser(row) {
  if (!row) {
    return null;
  }

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

async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  console.info('[DB] SELECT user WHERE email = ?', { email: normalizedEmail });

  const result = await pool.query(
    `SELECT id, name, email, password_hash, address, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [normalizedEmail],
  );

  console.info('[DB] User query result:', result.rowCount > 0 ? 'found' : 'not found');
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, address, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return mapUser(result.rows[0]);
}

module.exports = {
  findUserByEmail,
  findUserById,
  mapUser,
};
