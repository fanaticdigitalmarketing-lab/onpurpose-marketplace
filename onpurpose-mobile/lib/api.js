import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';

const api = axios.create({
  baseURL: API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('op_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await AsyncStorage.getItem('op_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(
            API_URL + '/api/auth/refresh',
            { refreshToken: refresh }
          );
          await AsyncStorage.setItem('op_token', data.accessToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem('op_refresh', data.refreshToken);
          }
          error.config.headers.Authorization = 
            `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch {
          await AsyncStorage.multiRemove(
            ['op_token','op_refresh','op_user']
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

// // // // // // // // // // // // // // // // // // export const authAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
};

// // // // // // // // // // // // // // // // // // export const servicesAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  getAll:   (params) => api.get('/services', { params }),
  getById:  (id)     => api.get(`/services/${id}`),
  getMine:  ()       => api.get('/services/my-services'),
  create:   (data)   => api.post('/services', data),
};

// // // // // // // // // // // // // // // // // // export const bookingsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  getMine:        () => api.get('/bookings/my-bookings'),
  getProvider:    () => api.get('/bookings/provider-bookings'),
  create:         (data) => api.post('/bookings', data),
  updateStatus:   (id, status) => 
    api.patch(`/bookings/${id}/status`, { status }),
};

// // // // // // // // // // // // // // // // // // export const paymentsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  checkout: (bookingId) => 
    api.post('/payments/create-checkout', { bookingId }),
};

// // // // // // // // // // // // // // // // // // export const usersAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  getProfile:    () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
};

export default api;
