import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name, userType) => 
    api.post('/auth/register', { email, password, name, userType }),
  verify: () => api.get('/auth/verify'),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadPhoto: (formData) => api.post('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const hostService = {
  getHosts: (params) => api.get('/hosts', { params }),
  getHost: (id) => api.get(`/hosts/${id}`),
  createProfile: (data) => api.post('/hosts', data),
  updateProfile: (data) => api.put('/hosts', data),
  getMyProfile: () => api.get('/hosts/me/profile'),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  getUpcoming: () => api.get('/bookings/upcoming'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getPending: () => api.get('/bookings/host/pending'),
};

export const paymentService = {
  createPaymentIntent: (bookingId) => 
    api.post('/payments/create-payment-intent', { bookingId }),
  confirmPayment: (paymentIntentId, bookingId) => 
    api.post('/payments/confirm-payment', { paymentIntentId, bookingId }),
  getHistory: () => api.get('/payments/history'),
  createConnectAccount: () => api.post('/payments/create-connect-account'),
};
