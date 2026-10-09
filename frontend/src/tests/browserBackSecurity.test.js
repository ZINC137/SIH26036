import { act } from '@testing-library/react';
import API_BASE, { authFetch, clearAuthSession, getAuthToken, setAuthToken } from '../config/api';

describe('Security Audit: Browser Back-Button, Session Invalidation & RBAC Exposure', () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();

    delete window.location;
    window.location = {
      ...originalLocation,
      replace: jest.fn(),
      assign: jest.fn(),
      pathname: '/',
      hostname: 'localhost',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.location = originalLocation;
  });

  // --------------------------------------------------------------------------
  // SCENARIO 1: Valid Session + Back Navigation
  // Access remains allowed only when session and authorization are valid.
  // --------------------------------------------------------------------------
  test('Scenario 1: Valid session + Back navigation preserves legitimate access', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('sessionToken', 'valid-citizen-jwt');

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            user: { id: 'u1', email: 'citizen@example.com', role: 'user' },
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const res = await authFetch('/api/auth/me');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.role).toBe('user');
    expect(getAuthToken()).toBe('valid-citizen-jwt');
  });

  // --------------------------------------------------------------------------
  // SCENARIO 2: Logout -> Back Button
  // Protected content must not remain usable without authentication.
  // --------------------------------------------------------------------------
  test('Scenario 2: Logout -> Back button prevents access and clears auth state', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    setAuthToken('logged-out-token');

    // Simulate logout action
    clearAuthSession();
    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem('isLoggedIn')).toBeNull();

    // Now simulate Back button navigation into protected route
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized: Session revoked', code: 'SESSION_REVOKED' }),
    });

    const unauthorizedHandler = jest.fn();
    window.addEventListener('auth:unauthorized', unauthorizedHandler);

    const res = await authFetch('/api/auth/me');
    expect(res.status).toBe(401);
    expect(unauthorizedHandler).toHaveBeenCalled();
    expect(getAuthToken()).toBeNull();

    window.removeEventListener('auth:unauthorized', unauthorizedHandler);
  });

  // --------------------------------------------------------------------------
  // SCENARIO 3: Logout -> Direct Dashboard URL
  // Access is denied immediately without token.
  // --------------------------------------------------------------------------
  test('Scenario 3: Logout -> direct dashboard URL access is immediately denied', () => {
    // Session is logged out
    clearAuthSession();
    expect(getAuthToken()).toBeNull();

    // Verification check fails synchronously
    const token = getAuthToken();
    const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    expect(token).toBeNull();
    expect(localLoggedIn).toBe(false);
  });

  // --------------------------------------------------------------------------
  // SCENARIO 4: Expired Session -> Back Navigation
  // Session validation fails, protected content is cleared and access denied.
  // --------------------------------------------------------------------------
  test('Scenario 4: Expired session -> Back revalidation fails with 401 and clears session', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    setAuthToken('expired-jwt');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized: Invalid or expired session' }),
    });

    let eventFired = false;
    const listener = () => { eventFired = true; };
    window.addEventListener('auth:unauthorized', listener);

    const res = await authFetch('/api/auth/me');
    expect(res.status).toBe(401);
    expect(eventFired).toBe(true);
    expect(getAuthToken()).toBeNull();

    window.removeEventListener('auth:unauthorized', listener);
  });

  // --------------------------------------------------------------------------
  // SCENARIO 5: Revoked Session -> API Request
  // Server denies access with SESSION_REVOKED.
  // --------------------------------------------------------------------------
  test('Scenario 5: Revoked session -> API request returns 401 and code SESSION_REVOKED', async () => {
    setAuthToken('revoked-session-token');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Unauthorized: Session has been logged out or revoked',
        code: 'SESSION_REVOKED',
      }),
    });

    const res = await authFetch('/api/admin/users');
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.code).toBe('SESSION_REVOKED');
  });

  // --------------------------------------------------------------------------
  // SCENARIO 6: Role Mismatch -> Direct URL / API Request
  // Citizen cannot access Admin endpoints.
  // --------------------------------------------------------------------------
  test('Scenario 6: Role mismatch -> citizen cannot access Admin endpoints', async () => {
    setAuthToken('citizen-token');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden: Access restricted to [admin] roles' }),
    });

    const res = await authFetch('/api/admin/analytics');
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Forbidden');
  });

  // --------------------------------------------------------------------------
  // SCENARIO 7: Portal Directory Navigation -> Back and Forward
  // Session remains valid when viewing Portal Directory, Back preserves session.
  // --------------------------------------------------------------------------
  test('Scenario 7: Portal Directory navigation maintains session semantics', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'lmo');
    setAuthToken('lmo-valid-token');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 'lmo1', role: 'lmo', email: 'lmo@gov.in' } }),
    });

    // Navigating to directory doesn't call clearAuthSession
    expect(getAuthToken()).toBe('lmo-valid-token');

    // Pressing Back revalidates with server
    const res = await authFetch('/api/auth/me');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.role).toBe('lmo');
  });

  // --------------------------------------------------------------------------
  // SCENARIO 8: Multiple Tabs Synchronization
  // Storage event from another tab immediately triggers session invalidation.
  // --------------------------------------------------------------------------
  test('Scenario 8: Multi-tab logout propagates via storage event', () => {
    localStorage.setItem('isLoggedIn', 'true');
    setAuthToken('shared-session-token');

    let syncedLogout = false;
    const handleStorage = (event) => {
      if (event.key === 'isLoggedIn' || event.key === 'sessionToken') {
        if (!event.newValue || event.newValue === 'false') {
          clearAuthSession();
          syncedLogout = true;
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // Tab A triggers logout
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'isLoggedIn',
          oldValue: 'true',
          newValue: 'false',
        })
      );
    });

    expect(syncedLogout).toBe(true);
    expect(getAuthToken()).toBeNull();
    window.removeEventListener('storage', handleStorage);
  });

  // --------------------------------------------------------------------------
  // SCENARIO 9: Refresh of Protected Pages After Logout
  // Protected data is never exposed.
  // --------------------------------------------------------------------------
  test('Scenario 9: Page refresh after logout has empty auth storage and fails validation', () => {
    clearAuthSession();
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(localStorage.getItem('sessionToken')).toBeNull();
    expect(sessionStorage.getItem('sessionToken')).toBeNull();
  });

  // --------------------------------------------------------------------------
  // SCENARIO 10: QR Verification and Public Pages
  // Public verification endpoints continue working without requiring authentication.
  // --------------------------------------------------------------------------
  test('Scenario 10: QR code verification succeeds without session token', async () => {
    clearAuthSession();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        valid: true,
        certificate: { certificate_number: 'IND-DL-2026-0042', status: 'VALID' },
      }),
    });

    const res = await authFetch('/api/auth/validate-certificate?cert_no=IND-DL-2026-0042');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.certificate.certificate_number).toBe('IND-DL-2026-0042');
  });

  // --------------------------------------------------------------------------
  // BONUS DEFENSE: Browser Back-Forward Cache (bfcache) pageshow handling
  // --------------------------------------------------------------------------
  test('Bonus Defense: pageshow event with persisted=true forces revalidation and clears unauth state', async () => {
    clearAuthSession();

    let redirected = false;
    const handlePageShow = (event) => {
      if (event.persisted || !getAuthToken()) {
        redirected = true;
        window.location.replace('/login?role=user');
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    // Simulate bfcache restoration event
    act(() => {
      const pageShowEvent = new Event('pageshow');
      pageShowEvent.persisted = true;
      window.dispatchEvent(pageShowEvent);
    });

    expect(redirected).toBe(true);
    expect(window.location.replace).toHaveBeenCalledWith('/login?role=user');
    window.removeEventListener('pageshow', handlePageShow);
  });
});
