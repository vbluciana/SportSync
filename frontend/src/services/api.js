import axios from 'axios';

// 1. Usa una URL configurable y mantiene localhost como valor local por defecto.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// 2. Interceptor: Antes de mandar CUALQUIER petición, le pegamos el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;