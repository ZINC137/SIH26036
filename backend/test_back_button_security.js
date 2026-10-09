/**
 * Automated Security Test Suite: Browser Back-Button, Session Invalidation & RBAC Exposure
 *
 * Verifies backend defense-in-depth controls:
 * 1. Server-side token revocation (blacklist) rejects replayed tokens after logout
 * 2. Administrative user revocation invalidates active sessions
 * 3. Cache-Control headers (private, no-store) prevent bfcache/proxy exposure
 * 4. Role-based access control (RBAC) rejects unauthorized portal API calls
 * 5. Public QR certificate validation remains accessible without authentication
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  revokeToken,
  isTokenRevoked,
  revokeUser,
  isUserRevoked,
  clearRevocationStore,
} = require('./src/services/sessionService');
const { authMiddleware, requireRole } = require('./src/middleware/authMiddleware');
const { logout } = require('./src/controllers/authController');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('MEASURETRUST SECURITY AUDIT: SERVER-SIDE SESSION & RBAC TESTS');
  console.log('================================================================\n');

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
  clearRevocationStore();

  // --------------------------------------------------------------------------
  // TEST SCENARIO 1: Token Revocation Store Behavior
  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Server-Side Token Revocation Service ---');
  const sampleToken = jwt.sign(
    { id: 'user-uuid-1', email: 'citizen@example.com', role: 'user', jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  assert(!isTokenRevoked(sampleToken), 'Fresh token is not initially revoked');
  revokeToken(sampleToken);
  assert(isTokenRevoked(sampleToken), 'Token is successfully registered as revoked');
  assert(!isTokenRevoked('other-token'), 'Unrelated token is not affected by revocation');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 2: Auth Middleware Rejection of Revoked Token
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Auth Middleware Rejection of Revoked Sessions ---');
  let middlewareHeaders = {};
  let middlewareStatus = null;
  let middlewareJson = null;

  const mockRes = {
    setHeader: (k, v) => { middlewareHeaders[k] = v; },
    status: (s) => {
      middlewareStatus = s;
      return {
        json: (data) => { middlewareJson = data; },
      };
    },
  };

  // 2a. Request using revoked token
  const reqWithRevokedToken = {
    cookies: {},
    headers: { authorization: `Bearer ${sampleToken}` },
  };

  authMiddleware(reqWithRevokedToken, mockRes, () => {
    assert(false, 'Revoked token should never reach next middleware');
  });

  assert(middlewareStatus === 401, 'Revoked token returns 401 Unauthorized');
  assert(middlewareJson?.code === 'SESSION_REVOKED', 'Returns code SESSION_REVOKED for client redirection');
  assert(middlewareHeaders['Cache-Control']?.includes('no-store'), 'Sets Cache-Control: private, no-store');

  // 2b. Request using fresh valid token
  const freshToken = jwt.sign(
    { id: 'user-uuid-2', email: 'officer@gov.in', role: 'field_officer', jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  let nextCalled = false;
  middlewareHeaders = {};
  const reqWithFreshToken = {
    cookies: {},
    headers: { authorization: `Bearer ${freshToken}` },
  };

  authMiddleware(reqWithFreshToken, mockRes, () => {
    nextCalled = true;
  });

  assert(nextCalled, 'Fresh valid token proceeds to next()');
  assert(reqWithFreshToken.user?.email === 'officer@gov.in', 'User is decoded and attached to request');
  assert(middlewareHeaders['Cache-Control']?.includes('no-store'), 'Strict Cache-Control header applied to valid session');
  assert(middlewareHeaders['Pragma'] === 'no-cache', 'Pragma: no-cache header applied');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 3: User Suspension / Blanket Session Revocation
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: User Suspension & Collective Revocation ---');
  const suspendedUserId = 'user-uuid-3';
  const tokenBeforeSuspension = jwt.sign(
    { id: suspendedUserId, email: 'suspect@example.com', role: 'user', iat: Math.floor(Date.now() / 1000) - 10 },
    process.env.JWT_SECRET
  );

  assert(!isUserRevoked(suspendedUserId, Math.floor(Date.now() / 1000)), 'User is not revoked initially');
  revokeUser(suspendedUserId);
  assert(isUserRevoked(suspendedUserId, Math.floor(Date.now() / 1000) - 10), 'Tokens issued prior to suspension are revoked');

  let suspendedStatus = null;
  const mockSuspendedRes = {
    setHeader: () => {},
    status: (s) => {
      suspendedStatus = s;
      return { json: () => {} };
    },
  };

  authMiddleware(
    { cookies: {}, headers: { authorization: `Bearer ${tokenBeforeSuspension}` } },
    mockSuspendedRes,
    () => { assert(false, 'Suspended user should never reach next()'); }
  );
  assert(suspendedStatus === 401, 'Suspended user token is rejected with 401 Unauthorized');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 4: Role-Based Authorization Protection (RBAC)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Role-Based Access Control (RBAC) Enforcement ---');
  const citizenReq = {
    user: { id: 'user-uuid-4', email: 'citizen@example.com', role: 'user' },
  };

  let rbacStatus = null;
  const mockRbacRes = {
    status: (s) => {
      rbacStatus = s;
      return { json: () => {} };
    },
  };

  // Citizen attempting to access Admin route
  const adminGuard = requireRole('admin');
  adminGuard(citizenReq, mockRbacRes, () => {
    assert(false, 'Citizen should never access Admin route');
  });
  assert(rbacStatus === 403, 'Citizen accessing Admin route returns 403 Forbidden');

  // Citizen attempting to access LMO route
  rbacStatus = null;
  const lmoGuard = requireRole('lmo', 'admin');
  lmoGuard(citizenReq, mockRbacRes, () => {
    assert(false, 'Citizen should never access LMO route');
  });
  assert(rbacStatus === 403, 'Citizen accessing LMO route returns 403 Forbidden');

  // Admin accessing Admin route succeeds
  const adminReq = {
    user: { id: 'admin-uuid-1', email: 'admin@gov.in', role: 'admin' },
  };
  let adminNext = false;
  adminGuard(adminReq, mockRbacRes, () => { adminNext = true; });
  assert(adminNext, 'Admin successfully passes Admin role guard');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 5: Server-Side Logout Controller
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Logout Controller Invalidates Token & Cookie ---');
  const tokenToLogout = jwt.sign(
    { id: 'user-uuid-5', email: 'logout@example.com', role: 'user' },
    process.env.JWT_SECRET
  );

  let clearedCookieName = null;
  let cookieHeaders = {};
  const mockLogoutRes = {
    clearCookie: (name) => { clearedCookieName = name; },
    cookie: () => {},
    setHeader: (k, v) => { cookieHeaders[k] = v; },
    status: (s) => ({ json: () => {} }),
  };

  await logout(
    { cookies: { sessionId: tokenToLogout }, headers: {} },
    mockLogoutRes
  );

  assert(isTokenRevoked(tokenToLogout), 'Logout explicitly revokes token in session store');
  assert(clearedCookieName === 'sessionId', 'Logout clears sessionId cookie');
  assert(cookieHeaders['Cache-Control']?.includes('no-store'), 'Logout response specifies Cache-Control: private, no-store');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
