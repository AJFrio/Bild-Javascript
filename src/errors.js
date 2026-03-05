class BildApiError extends Error {
  constructor(message, statusCode = null, payload = null) {
    super(message);
    this.name = 'BildApiError';
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

class BildAuthError extends BildApiError {
  constructor(message = 'Authentication/authorization failed', statusCode = null, payload = null) {
    super(message, statusCode, payload);
    this.name = 'BildAuthError';
  }
}

module.exports = { BildApiError, BildAuthError };
