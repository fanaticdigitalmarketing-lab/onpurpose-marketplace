// ══════════════════════════════════════════════════════════════
// OnPurpose API Module — Vanilla JavaScript (no build step)
// ══════════════════════════════════════════════════════════════

const API_BASE_URL = '/api';

// ── TOKEN HELPERS ─────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('op_token');
const getRefreshToken = () => localStorage.getItem('op_refresh');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('op_token', accessToken);
  if (refreshToken) localStorage.setItem('op_refresh', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('op_token');
  localStorage.removeItem('op_refresh');
  localStorage.removeItem('op_user');
};

// ── FETCH WRAPPER WITH AUTO TOKEN REFRESH ─────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

async function apiFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // ── 401 → try refresh token ──
    if (response.status === 401 && !url.includes('/auth/refresh')) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/';
        throw new Error('Session expired');
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          headers.Authorization = `Bearer ${newToken}`;
          return fetch(`${API_BASE_URL}${url}`, { ...config, headers });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error('Refresh failed');

        const refreshData = await refreshResponse.json();
        const { accessToken, refreshToken: newRefresh } = refreshData.data || refreshData;
        setTokens(accessToken, newRefresh);
        processQueue(null, accessToken);

        headers.Authorization = `Bearer ${accessToken}`;
        return fetch(`${API_BASE_URL}${url}`, { ...config, headers });
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/';
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 → suspended or unverified ──
    if (response.status === 403) {
      const data = await response.json();
      const msg = data.error || '';
      if (msg.includes('suspended')) {
        clearTokens();
        window.location.href = '/?reason=suspended';
      }
    }

    return response;
  } catch (error) {
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      throw new Error('Cannot reach the server. Please check your connection.');
    }
    throw error;
  }
}

// ── AUTH API ──────────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const authAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async register(userData) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async login(userData) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async logout() {
    const res = await apiFetch('/auth/logout', { method: 'POST' });
    return res.json();
  },

  async verifyEmail(token) {
    const res = await apiFetch(`/auth/verify-email?token=${token}`);
    return res.json();
  },

  async forgotPassword(email) {
    const res = await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(token, password) {
    const res = await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    return res.json();
  },

  saveSession(accessToken, refreshToken, user) {
    setTokens(accessToken, refreshToken);
    localStorage.setItem('op_user', JSON.stringify(user));
  },

  clearSession() {
    clearTokens();
  },

  getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('op_user'));
    } catch {
      return null;
    }
  },
};

// ── SERVICES / LISTINGS API ───────────────────────────────────
// // // // // // // // // // // // // // // // // // const listingsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`/services${query ? '?' + query : ''}`);
    return res.json();
  },

  async getById(id) {
    const res = await apiFetch(`/services/${id}`);
    return res.json();
  },

  async create(listingData) {
    const res = await apiFetch('/services', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
    return res.json();
  },

  async update(id, listingData) {
    const res = await apiFetch(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(listingData),
    });
    return res.json();
  },

  async deactivate(id) {
    const res = await apiFetch(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    });
    return res.json();
  },

  async getMyListings() {
    const res = await apiFetch('/services/my-services');
    return res.json();
  },

  async getReviews(serviceId) {
    const res = await apiFetch(`/services/${serviceId}/reviews`);
    return res.json();
  },
};

// ── BOOKINGS API ──────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const bookingsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async create(bookingData) {
    const res = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  async getMyBookings() {
    const res = await apiFetch('/bookings/my-bookings');
    return res.json();
  },

  async getProviderBookings() {
    const res = await apiFetch('/bookings/provider-bookings');
    return res.json();
  },

  async updateStatus(id, status) {
    const res = await apiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};

// ── PAYMENTS API ──────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const paymentsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async createCheckout(bookingId) {
    const res = await apiFetch('/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
    return res.json();
  },
};

// ── REVIEWS API ───────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const reviewsAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async create(bookingId, rating, comment) {
    const res = await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    return res.json();
  },
};

// ── USERS API ─────────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const usersAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async getProfile() {
    const res = await apiFetch('/users/profile');
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await apiFetch('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  async deleteAccount() {
    const res = await apiFetch('/users/me', { method: 'DELETE' });
    return res.json();
  },
};

// ── AVAILABILITY API ──────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const availabilityAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async getByProvider(providerId) {
    const res = await apiFetch(`/availability/${providerId}`);
    return res.json();
  },

  async setHours(dayOfWeek, startTime, endTime) {
    const res = await apiFetch('/availability', {
      method: 'POST',
      body: JSON.stringify({ dayOfWeek, startTime, endTime }),
    });
    return res.json();
  },

  async blockDate(date, reason) {
    const res = await apiFetch('/availability/block', {
      method: 'POST',
      body: JSON.stringify({ date, reason }),
    });
    return res.json();
  },
};

// ── CHECK-IN API ──────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const checkinAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async generateQR(bookingId) {
    const res = await apiFetch('/checkin/generate', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
    return res.json();
  },

  async scan(qrToken) {
    const res = await apiFetch('/checkin/scan', {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    });
    return res.json();
  },

  async complete(bookingId, notes) {
    const res = await apiFetch('/checkin/complete', {
      method: 'POST',
      body: JSON.stringify({ bookingId, notes }),
    });
    return res.json();
  },

  async getStatus(bookingId) {
    const res = await apiFetch(`/checkin/status/${bookingId}`);
    return res.json();
  },
};

// ── HEALTH CHECK ──────────────────────────────────────────────
// // // // // // // // // // // // // // // // // // const healthAPI = { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  async check() {
    const res = await fetch('/health');
    return res.json();
  },
};
