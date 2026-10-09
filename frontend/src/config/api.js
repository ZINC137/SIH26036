// Use same-origin requests through the development proxy unless deployment config sets an API origin.
export const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' &&
  window.location &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://sih26036-final.onrender.com'
    : '')
).replace(/\/+$/, '');

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('sessionToken', token);
    sessionStorage.setItem('sessionToken', token);
  } else {
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('sessionToken');
  }
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  sessionStorage.removeItem('sessionToken');
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userEmail');
};

export const authFetch = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  const headers = getAuthHeaders(options.headers || {});
  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (res.status === 401) {
    if (
      !url.includes('/api/auth/login') &&
      !url.includes('/api/auth/register') &&
      !url.includes('/api/auth/validate-certificate')
    ) {
      clearAuthSession();
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', { detail: { url, status: 401 } })
        );
      }
    }
  }
  return res;
};

export default API_BASE;
