const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function hashPassword(password) {
  console.info('[AUTH] Hashing password');
  return bcrypt.hash(password, SALT_ROUNDS);
}

function comparePasswords(password, passwordHash) {
  console.info('[AUTH] Comparing password');
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  hashPassword,
  comparePasswords,
};
