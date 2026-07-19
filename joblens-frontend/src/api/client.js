import axios from 'axios';

const normalizeApiBaseUrl = (url) => {
  const trimmed = (url || '').replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:5000/api/v1';
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
