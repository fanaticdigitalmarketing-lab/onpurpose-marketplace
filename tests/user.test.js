const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Mock the database pool
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const pool = require('../config/database');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User.create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
      };

      const mockResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          isHost: false,
          isVerified: false,
          createdAt: new Date(),
        }],
      };

      pool.query.mockResolvedValue(mockResult);

      const result = await User.create(userData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "Users"'),
        expect.arrayContaining([
          'test@example.com',
          expect.any(String), // hashed password
          'John',
          'Doe',
          '+1234567890',
          '1990-01-01',
          false,
        ])
      );
      expect(result).toEqual(mockResult.rows[0]);
    });
  });

  describe('User.findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM "Users" WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('User.findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM "Users" WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('User.verifyPassword', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await User.verifyPassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('User.updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        firstName: 'Jane',
        phone: '+9876543210',
      };

      const mockResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+9876543210',
          updatedAt: new Date(),
        }],
      };

      pool.query.mockResolvedValue(mockResult);

      const result = await User.updateProfile(1, updates);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "Users"'),
        expect.arrayContaining(['Jane', '+9876543210', 1])
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should throw error if no valid fields to update', async () => {
      const updates = {
        id: 1,
        password: 'newpassword',
      };

      await expect(User.updateProfile(1, updates)).rejects.toThrow('No valid fields to update');
    });
  });
});
