import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';

export const api = axios.create({
  baseURL: `${apiBase}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request token interceptor is managed dynamically by AuthProvider in AuthContext.tsx

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

