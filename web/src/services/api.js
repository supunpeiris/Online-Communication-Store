import axios from 'axios';

// Ensure your .env file has VITE_API_URL=http://localhost:5143/api/v1
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5143/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject the JWT token into requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
