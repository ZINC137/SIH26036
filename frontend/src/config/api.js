// Use same-origin requests through the development proxy unless deployment config sets an API origin.
export const API_BASE = process.env.REACT_APP_API_URL || '';
export default API_BASE;
