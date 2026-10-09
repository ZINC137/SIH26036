const crypto = require('crypto');

/**
 * Server-Side Session & Token Revocation Store
 *
 * Implements token blacklist and per-user session invalidation.
 * Tokens revoked during logout or administrative action are rejected
 * by authMiddleware, preventing unauthorized API access using previously
 * issued credentials or restored browser history.
 */

// In-memory revoked token map: tokenHash -> expiryTimestamp (ms)
const revokedTokens = new Map();

// In-memory revoked user sessions: userId -> revocationTimestamp (ms)
const revokedUsers = new Map();

// Helper to hash tokens for constant-size in-memory lookup
const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

/**
 * Revoke a specific JWT token (called on logout)
 * @param {string} token - Raw JWT string
 * @param {number} [expiresInMs] - Optional explicit expiry duration in ms
 */
const revokeToken = (token, expiresInMs = 24 * 60 * 60 * 1000) => {
  if (!token) return;
  const hash = hashToken(token);
  const expiresAt = Date.now() + expiresInMs;
  revokedTokens.set(hash, expiresAt);
};

/**
 * Check if a token has been explicitly revoked
 * @param {string} token - Raw JWT string
 * @returns {boolean} - True if revoked
 */
const isTokenRevoked = (token) => {
  if (!token) return false;
  const hash = hashToken(token);
  const expiry = revokedTokens.get(hash);
  if (!expiry) return false;

  // Prune if already past expiry
  if (Date.now() > expiry) {
    revokedTokens.delete(hash);
    return false;
  }
  return true;
};

/**
 * Invalidate all active sessions for a specific user
 * (e.g., password change, administrative suspension, or global logout)
 * @param {string} userId - User UUID
 */
const revokeUser = (userId) => {
  if (!userId) return;
  revokedUsers.set(userId, Date.now());
};

/**
 * Check if all tokens for a user issued before revocation are invalid
 * @param {string} userId - User UUID
 * @param {number} tokenIat - Token issued-at timestamp in seconds (from JWT)
 * @returns {boolean} - True if revoked
 */
const isUserRevoked = (userId, tokenIat) => {
  if (!userId) return false;
  const revocationTime = revokedUsers.get(userId);
  if (!revocationTime) return false;

  // If token was issued before the revocation timestamp, it is invalid
  const tokenIssuedAtMs = (tokenIat || 0) * 1000;
  return tokenIssuedAtMs <= revocationTime;
};

/**
 * Periodically purge expired tokens to maintain optimal memory usage
 */
setInterval(() => {
  const now = Date.now();
  for (const [hash, expiry] of revokedTokens.entries()) {
    if (now > expiry) {
      revokedTokens.delete(hash);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Reset revocation store (for automated test environments)
 */
const clearRevocationStore = () => {
  revokedTokens.clear();
  revokedUsers.clear();
};

module.exports = {
  revokeToken,
  isTokenRevoked,
  revokeUser,
  isUserRevoked,
  clearRevocationStore,
  hashToken,
};
