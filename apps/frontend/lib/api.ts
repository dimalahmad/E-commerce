import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const apiClient = {
  getCategories: async () => {
    const res = await axios.get(`${API_BASE_URL}/categories`)
    return res.data
  },
  getProducts: async () => {
    const res = await axios.get(`${API_BASE_URL}/products`)
    return res.data
  },
  getProduct: async (id: number) => {
    const res = await axios.get(`${API_BASE_URL}/products/${id}`);
    return res.data;
  },
  register: async ({ name, email, password }: { name: string, email: string, password: string }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    return res.data;
  },
  googleAuth: async (googleData: { email: string, name: string, googleId: string }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/google`, googleData);
    return res.data;
  },
  login: async ({ email, password }: { email: string, password: string }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return res.data;
  },
  createOrder: async (orderPayload: any) => {
    const res = await axios.post(`${API_BASE_URL}/orders`, orderPayload);
    return res.data;
  },
  getOrders: async () => {
    const res = await axios.get(`${API_BASE_URL}/orders`);
    return res.data;
  },
  getOrder: async (id: string | number) => {
    const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
    return res.data;
  },
  updateOrder: async (id: string | number, payload: any) => {
    const res = await axios.put(`${API_BASE_URL}/orders/${id}`, payload);
    return res.data;
  },
  updateOrderStatus: async (id: string | number, status: string) => {
    const res = await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status });
    return res.data;
  },
  // Tambahkan fungsi lain sesuai kebutuhan
} 