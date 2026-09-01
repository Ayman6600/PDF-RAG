import axios from 'axios';

export function getApiBaseUrl(): string {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (envUrl.endsWith('/api/v1')) {
    envUrl = envUrl.substring(0, envUrl.length - 7);
  }
  return envUrl.replace(/\/+$/, '');
}

export function getApiV1Url(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/v1` : '/api/v1';
}

export const api = axios.create({
  baseURL: getApiV1Url(),
});

// Automatically clean headers for FormData payloads
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    const extractedMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Failed to connect to backend server';

    const formattedError = {
      status: error.response?.status,
      message: extractedMessage,
      code: error.response?.data?.error?.code || error.code || 'REQUEST_FAILED',
      raw: error,
    };

    return Promise.reject(formattedError);
  },
);
