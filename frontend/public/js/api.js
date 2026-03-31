/**
 * OnPurpose API Client
 * Vanilla JS API client for use in HTML pages via <script src="/js/api.js">
 * Exposes: authAPI, listingsAPI, bookingsAPI, paymentsAPI
 */
(function () {
  'use strict';

  var API_BASE = '/api';

  // --- Helpers ---

  function getToken() {
    return localStorage.getItem('token');
  }

  function buildQuery(params) {
    if (!params || typeof params !== 'object') return '';
    var parts = [];
    Object.keys(params).forEach(function (key) {
      if (params[key] != null) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  function request(method, path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    var opts = { method: method, headers: headers };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    return fetch(API_BASE + path, opts).then(function (res) {
      // Handle 401 globally
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
        return Promise.reject(new Error('Unauthorized'));
      }

      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || 'Request failed');
          err.status = res.status;
          err.data = data;
          return Promise.reject(err);
        }
        return data;
      });
    });
  }

  // --- Auth API ---

  window.authAPI = {
    register: function (userData) {
      return request('POST', '/auth/register', userData);
    },
    login: function (userData) {
      return request('POST', '/auth/login', userData);
    },
    saveSession: function (accessToken, refreshToken, user) {
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    getSession: function () {
      var token = getToken();
      var user = localStorage.getItem('user');
      return {
        token: token,
        user: user ? JSON.parse(user) : null,
        isLoggedIn: !!token,
      };
    },
    logout: function () {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  };

  // --- Listings / Services API ---

  window.listingsAPI = {
    getAll: function (params) {
      return request('GET', '/services' + buildQuery(params));
    },
    getById: function (id) {
      return request('GET', '/services/' + id);
    },
    create: function (data) {
      return request('POST', '/services', data);
    },
    update: function (id, data) {
      return request('PUT', '/services/' + id, data);
    },
    delete: function (id) {
      return request('DELETE', '/services/' + id);
    },
    getMyListings: function () {
      return request('GET', '/services/my-services');
    },
  };

  // --- Bookings API ---

  window.bookingsAPI = {
    create: function (data) {
      return request('POST', '/bookings', data);
    },
    getMyBookings: function () {
      return request('GET', '/bookings/my-bookings');
    },
    getListingBookings: function (serviceId) {
      return request('GET', '/bookings/service/' + serviceId);
    },
    updateStatus: function (id, status) {
      return request('PUT', '/bookings/' + id, { status: status });
    },
  };

  // --- Payments API ---

  window.paymentsAPI = {
    createCheckout: function (bookingId) {
      return request('POST', '/payments/checkout', { bookingId: bookingId });
    },
    getStatus: function (bookingId) {
      return request('GET', '/payments/status/' + bookingId);
    },
  };
})();
