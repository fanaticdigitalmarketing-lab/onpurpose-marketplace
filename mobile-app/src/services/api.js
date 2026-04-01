import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://onpurpose.earth/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth API
// // // // // // // // // // // // // // // // // // export const authAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData),
};

// Hosts API
// // // // // // // // // // // // // // // // // // export const hostsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  getHosts: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/hosts?${params}`);
  },
  
  getHostProfile: (hostId) => 
    api.get(`/hosts/profile/${hostId}`),
  
  searchHosts: (searchQuery, filters = {}) => {
    const params = new URLSearchParams({ search: searchQuery, ...filters }).toString();
    return api.get(`/hosts?${params}`);
  },
};

// Bookings API
// // // // // // // // // // // // // // // // // // export const bookingsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  createBooking: (bookingData) => 
    api.post('/bookings', bookingData),
  
  getBookings: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/bookings?${params}`);
  },
  
  updateBooking: (bookingId, updateData) => 
    api.put(`/bookings/${bookingId}`, updateData),
  
  cancelBooking: (bookingId) => 
    api.put(`/bookings/${bookingId}`, { status: 'cancelled' }),
};

// Payments API
// // // // // // // // // // // // // // // // // // export const paymentsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  createPaymentIntent: (bookingId, amount) => 
    api.post('/payments/create-intent', { bookingId, amount }),
  
  confirmPayment: (paymentIntentId) => 
    api.post('/payments/confirm', { paymentIntentId }),
  
  getPaymentHistory: () => 
    api.get('/payments/history'),
  
  requestRefund: (paymentIntentId, reason) => 
    api.post('/payments/refund', { paymentIntentId, reason }),
};

// Reviews API
// // // // // // // // // // // // // // // // // // export const reviewsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  submitReview: (reviewData) => 
    api.post('/reviews', reviewData),
  
  getHostReviews: (hostId) => 
    api.get(`/reviews/host/${hostId}`),
  
  respondToReview: (reviewId, response) => 
    api.put(`/reviews/respond/${reviewId}`, { hostResponse: response }),
};

// Host Application API (for hosts)
// // // // // // // // // // // // // // // // // // export const hostApplicationAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  submitApplication: (applicationData) => 
    api.post('/host-application', applicationData),
  
  getApplicationStatus: () => 
    api.get('/host-application/status'),
};

export default api;
