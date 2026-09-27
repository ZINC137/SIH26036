// Centralized API Base URL configuration for development, Docker, and production deployments
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export default API_BASE;
