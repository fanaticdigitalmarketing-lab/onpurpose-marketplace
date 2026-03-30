const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Register a test user and get auth token
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+1234567890',
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    if (registerResponse.status === 201) {
      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    }
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should register, login, and access profile', async () => {
      const userData = {
        firstName: 'Integration',
        lastName: 'Test',
        email: `integration${Date.now()}@example.com`,
        password: 'password123',
      };

      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();

      // Access profile
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.email).toBe(userData.email);
    });
  });

  describe('API Routes', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OnPurpose API Server');
      expect(response.body.endpoints).toContain('/api/auth');
    });
  });

  describe('Protected Routes', () => {
    it('should reject requests without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject requests with invalid auth token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Route not found');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Payment Integration', () => {
    it('should create payment intent', async () => {
      const paymentData = {
        amount: 100,
        currency: 'usd',
        bookingId: 1,
      };

      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send(paymentData);

      // This might fail if Stripe keys are not configured
      if (response.status === 200) {
        expect(response.body.clientSecret).toBeDefined();
        expect(response.body.paymentIntentId).toBeDefined();
      } else {
        expect(response.status).toBe(500);
      }
    });

    it('should reject payment intent with invalid amount', async () => {
      const paymentData = {
        amount: 0.25, // Below minimum
        currency: 'usd',
      };

      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount must be at least $0.50');
    });
  });
});
