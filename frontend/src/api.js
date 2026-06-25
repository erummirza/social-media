// src/api.js
import axios from 'axios';

// ✅ IMPORTANT: This must point to your backend URL
const API = axios.create({
  baseURL: 'http://localhost:5005/api',  // ← Your backend port is 5005
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Log the full URL for debugging
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasToken: !!token,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ── Response Interceptor ──
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    // If 401 or 403, redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

export default API;