const ApiError = require('./apiError');

function mapDbError(error) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  switch (error.code) {
    case '23505': {
      if (error.constraint === 'users_email_key') {
        return new ApiError(409, 'Email already exists');
      }

      return new ApiError(409, 'Duplicate value violates a unique constraint');
    }
    case '23514': {
      if (error.constraint === 'users_name_length_chk') {
        return new ApiError(400, 'Name must be between 20 and 60 characters');
      }

      if (error.constraint === 'users_address_length_chk') {
        return new ApiError(400, 'Address must be 400 characters or fewer');
      }

      return new ApiError(400, 'Database validation failed');
    }
    default:
      return null;
  }
}

module.exports = {
  mapDbError,
};
