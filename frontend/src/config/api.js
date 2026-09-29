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

export default API_BASE;
