const jwt = require('jsonwebtoken');

/**
 * Generate a JWT access token.
 * @param {object} payload  Data to embed in token (userId, role)
 * @returns {string}        Signed JWT string
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generate a JWT refresh token.
 * Longer-lived token used to issue new access tokens.
 * @param {object} payload  Data to embed in token (userId)
 * @returns {string}        Signed refresh JWT string
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT access token.
 * @param {string} token
 * @returns {object}  Decoded payload
 * @throws  {JsonWebTokenError|TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a JWT refresh token.
 * @param {string} token
 * @returns {object}  Decoded payload
 * @throws  {JsonWebTokenError|TokenExpiredError}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Extract Bearer token from an Authorization header value.
 * @param {string} authHeader  Value of req.headers.authorization
 * @returns {string|null}      The raw token or null if not found / malformed
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token && token.trim() !== '' ? token : null;
};

/**
 * Generate both access and refresh tokens for a user.
 * Used at login and token refresh endpoints.
 * @param {object} user  Mongoose user document (or plain object with _id, role)
 * @returns {{ accessToken, refreshToken }}
 */
const generateTokenPair = (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: user._id.toString() }),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
  generateTokenPair,
};
