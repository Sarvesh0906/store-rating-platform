const { pool } = require('../config/db');

async function syncSequence(tableName) {
  await pool.query(`
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
      EXISTS(SELECT 1 FROM ${tableName})
    )
  `);
}

async function syncDatabaseSequences() {
  await syncSequence('users');
  await syncSequence('stores');
  await syncSequence('ratings');
}

module.exports = {
  syncDatabaseSequences,
};
