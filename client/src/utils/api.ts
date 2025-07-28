import axios from 'axios';
import { authCookies } from './cookies';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try cookies first, then localStorage as fallback
    const cookieToken = authCookies.getAuthToken();
    const stackToken = localStorage.getItem('stack-auth-token');
    const jwtToken = localStorage.getItem('jwt-auth-token');

    const token = cookieToken || stackToken || jwtToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both tokens and redirect to login
      localStorage.removeItem('stack-auth-token');
      localStorage.removeItem('jwt-auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
