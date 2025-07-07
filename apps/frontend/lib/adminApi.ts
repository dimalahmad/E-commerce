import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Category API
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string }) => api.post('/categories', data),
  update: (id: number, data: { name: string }) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Product API
export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: { name: string; price: number; stock: number; categoryId: string; discount?: number }) => 
    api.post('/products', data),
  update: (id: number, data: { name: string; price: number; stock: number; categoryId: string; discount?: number }) => 
    api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// User API
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: { username: string; email: string; password: string; alamat: string; role?: string }) => 
    api.post('/users', data),
  update: (id: number, data: { username?: string; email?: string; password?: string; alamat?: string; role?: string }) => 
    api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Dashboard/Report API
export const dashboardApi = {
  getComplex: (params?: any) => api.get('/reports/complex', { params }),
};

// Order API
export const orderApi = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
};

export default api; 