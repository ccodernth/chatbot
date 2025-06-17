// app/services/adminAPI.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance with auth header
const adminAxios = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => adminAxios.get('/dashboard'),
  getSalesChart: (days = 30) => adminAxios.get(`/dashboard/sales-chart?days=${days}`),
  getCategoryDistribution: () => adminAxios.get('/dashboard/category-distribution'),

  // Products
  uploadProductImages: (formData) => {
    return adminAxios.post('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  bulkUpdateProducts: (productIds, updates) => 
    adminAxios.put('/products/bulk-update', { productIds, updates }),
  bulkDeleteProducts: (productIds) => 
    adminAxios.delete('/products/bulk-delete', { data: { productIds } }),

  // Users
  getUsers: (params = {}) => adminAxios.get('/users', { params }),
  updateUserRole: (userId, role) => 
    adminAxios.put(`/users/${userId}/role`, { role }),

  // Orders
  getOrders: (params = {}) => adminAxios.get('/orders', { params }),
  updateOrderStatus: (orderId, status) => 
    adminAxios.put(`/orders/${orderId}/status`, { status }),

  // System
  getSystemLogs: () => adminAxios.get('/logs')
};

// Product API (admin endpoints)
export const productAPI = {
  create: (productData) => 
    axios.post(`${API_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }),
  
  update: (productId, productData) => 
    axios.put(`${API_URL}/products/${productId}`, productData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }),
  
  delete: (productId) => 
    axios.delete(`${API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),
  
  getAll: (params = {}) => 
    axios.get(`${API_URL}/products`, { params }),
  
  getById: (productId) => 
    axios.get(`${API_URL}/products/${productId}`)
};