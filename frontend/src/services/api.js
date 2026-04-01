import axios from 'axios';

// Use unified API configuration from config.js
const api = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('op_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('op_token');
      localStorage.removeItem('op_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

// Listings/Services API
export const listingsAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (listingData) => api.post('/services', listingData),
  update: (id, listingData) => api.put(`/services/${id}`, listingData),
  delete: (id) => api.delete(`/services/${id}`),
  getMyListings: () => api.get('/services/my-services'),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getListingBookings: (serviceId) => api.get(`/bookings/service/${serviceId}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}`, { status }),
};

export default api;
