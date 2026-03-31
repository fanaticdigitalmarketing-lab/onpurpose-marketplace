# API Endpoints Inventory - OnPurpose Backend

**Backend URL**: https://onpurpose-backend-clean-production.up.railway.app

---

## 🔐 AUTHENTICATION ENDPOINTS

| Method | Endpoint | Auth Required | Rate Limited | Purpose |
|--------|----------|---------------|--------------|---------|
| POST | `/api/auth/register` | No | Yes (auth) | User registration |
| POST | `/api/auth/login` | No | Yes (auth) | User login |
| POST | `/api/auth/refresh` | No | No | Refresh access token |
| POST | `/api/auth/logout` | Yes | No | User logout |
| GET | `/api/auth/verify-email` | No | No | Email verification |
| POST | `/api/auth/forgot-password` | No | Yes (auth) | Password reset request |
| POST | `/api/auth/reset-password` | No | No | Password reset completion |

---

## 🛍️ SERVICE ENDPOINTS

| Method | Endpoint | Auth Required | Role | Purpose |
|--------|----------|---------------|------|---------|
| GET | `/api/services` | Optional | Any | List all active services |
| POST | `/api/services` | Yes | Provider/Admin | Create new service |
| GET | `/api/services/my-services` | Yes | Provider/Admin | Get provider's services |
| GET | `/api/services/:id` | No | Any | Get service details |
| PATCH | `/api/services/:id` | Yes | Provider/Admin | Update service |
| GET | `/api/services/:id/reviews` | No | Any | Get service reviews |

---

## 📅 BOOKING ENDPOINTS

| Method | Endpoint | Auth Required | Rate Limited | Purpose |
|--------|----------|---------------|--------------|---------|
| POST | `/api/bookings` | Yes | Yes (booking) | Create booking |
| GET | `/api/bookings/my-bookings` | Yes | No | Get user's bookings |
| GET | `/api/bookings/provider-bookings` | Yes (Provider) | No | Get provider's bookings |
| PATCH | `/api/bookings/:id/status` | Yes | No | Update booking status |

---

## 💳 PAYMENT ENDPOINTS

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/payments/create-checkout` | Yes | Create Stripe checkout session |
| POST | `/api/webhooks/stripe` | No | Stripe webhook handler |

---

## ⭐ REVIEW ENDPOINTS

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/reviews` | Yes | Create review for booking |

---

## 👤 USER ENDPOINTS

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/users/profile` | Yes | Get user profile |
| PATCH | `/api/users/profile` | Yes | Update user profile |
| DELETE | `/api/users/me` | Yes | Delete user account |

---

## 📆 AVAILABILITY ENDPOINTS

| Method | Endpoint | Auth Required | Role | Purpose |
|--------|----------|---------------|------|---------|
| GET | `/api/availability/:providerId` | No | Any | Get provider availability |
| POST | `/api/availability` | Yes | Provider/Admin | Set availability |
| POST | `/api/availability/block` | Yes | Provider/Admin | Block specific dates |

---

## 👨‍💼 ADMIN ENDPOINTS

| Method | Endpoint | Auth Required | Role | Purpose |
|--------|----------|---------------|------|---------|
| GET | `/api/stats` | Yes | Admin | Get platform statistics |
| PATCH | `/api/admin/users/:id/suspend` | Yes | Admin | Suspend/unsuspend user |
| PATCH | `/api/admin/services/:id/deactivate` | Yes | Admin | Deactivate service |

---

## 🔧 UTILITY ENDPOINTS

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/early-access` | No | Join early access list |
| GET | `/health` | No | Health check |
| GET | `/api/health` | No | API health check with DB status |
| GET | `/debug/files` | No | Debug file system |

---

## 🔒 SECURITY FEATURES

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- **Booking endpoints**: 10 requests per hour
- **General API**: 100 requests per 15 minutes

### Authentication
- **JWT tokens**: Access + Refresh token pattern
- **Password hashing**: bcrypt with pepper
- **Email verification**: Token-based verification

### Validation
- **Input sanitization**: XSS protection
- **Request validation**: express-validator
- **CORS**: Configured for Netlify domains

---

## 📊 TOTAL ENDPOINTS: 30+

**Breakdown**:
- Authentication: 7 endpoints
- Services: 6 endpoints
- Bookings: 4 endpoints
- Payments: 2 endpoints
- Reviews: 1 endpoint
- Users: 3 endpoints
- Availability: 3 endpoints
- Admin: 3 endpoints
- Utility: 4 endpoints
