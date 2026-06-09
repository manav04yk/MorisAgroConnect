import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auth
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Inventory
export const addInventory = (data) => api.post('/inventory', data);
export const getFarmerInventory = (farmerId) => api.get(`/inventory/${farmerId}`);

// Requests
export const createProduceRequest = (data) => api.post('/requests', data);
export const getRequestById = (id) => api.get(`/requests/${id}`);

// Quotations
export const getQuotations = () => api.get('/quotations');
export const approveQuotation = (id) => api.patch(`/quotations/${id}/approve`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Invoices
export const getInvoices = () => api.get('/invoices');

// Deliveries
export const getDeliveries = () => api.get('/deliveries');
export const updateDeliveryStatus = (id, status) =>
  api.patch(`/deliveries/${id}/status`, { status });

// Waste marketplace
export const createWasteListing = (data) => api.post('/waste', data);
export const getWasteListings = () => api.get('/waste');

// Sustainability
export const getSustainability = (buyerId) => api.get(`/sustainability/${buyerId}`);

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');

  if (userStr) {
    return JSON.parse(userStr);
  }

  const token = localStorage.getItem('token');

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

export default api;