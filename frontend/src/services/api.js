import axios from 'axios';

// 1. Creamos la instancia base apuntando a nuestro backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
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