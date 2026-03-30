const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

// Mock the User model
jest.mock('../models/user', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

const User = require('../models/user');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        phone: '+1234567890',
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Doe',
        isHost: false,
        isVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('john@test.com');
    });

    it('should return error if user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@test.com',
        password: 'password123',
      };

      User.findByEmail.mockResolvedValue({ id: 1, email: 'existing@test.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists with this email');
    });

    it('should return validation errors for invalid input', async () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        password: '123', // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'john@test.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '$2a$12$hashedpassword',
        isHost: false,
        isVerified: true,
      };

      User.findByEmail.mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare to return true
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('john@test.com');
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'john@test.com',
        password: 'wrongpassword',
      };

      User.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        isHost: false,
        isVerified: true,
      };

      User.findById.mockResolvedValue(mockUser);

      // Create a valid JWT token for testing
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 1, email: 'john@test.com' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('john@test.com');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });
});
