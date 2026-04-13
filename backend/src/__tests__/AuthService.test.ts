import { AuthService } from '../services/AuthService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

const mockUser: User = {
  id: '123',
  full_name: 'Test User',
  email: 'test@test.com',
  password_hash: '$2b$12$LJ3R5HnWz3g8S3jN8K/4eO8v6T0H4rQ7X1J5Z6K9L0M2N3O4P5Q6R',
  phone: '05551234567',
  role: 'customer',
  created_at: new Date(),
  updated_at: new Date(),
};

function createMockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue([]),
    findByRole: jest.fn().mockResolvedValue([]),
    findByPhone: jest.fn().mockResolvedValue(null),
    getProviderServices: jest.fn().mockResolvedValue([]),
    deleteById: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

jest.mock('../config/environment', () => ({
  config: {
    jwtSecret: 'test-secret-key-for-testing',
    jwtExpiresIn: '7d',
  },
}));

describe('AuthService', () => {
  describe('registerCustomer', () => {
    it('should register a new customer successfully', async () => {
      const repo = createMockRepo();
      const service = new AuthService(repo);

      const result = await service.registerCustomer({
        full_name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
      });

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.role).toBe('customer');
      expect((result.user as any).password_hash).toBeUndefined();
    });

    it('should throw error if email already exists', async () => {
      const repo = createMockRepo({
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      });
      const service = new AuthService(repo);

      await expect(
        service.registerCustomer({
          full_name: 'Test',
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should throw error for non-existent email', async () => {
      const repo = createMockRepo();
      const service = new AuthService(repo);

      await expect(
        service.login({ email: 'nonexist@test.com', password: 'pass' })
      ).rejects.toThrow('Email veya şifre hatalı');
    });

    it('should throw error for wrong password', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('correctpassword', 12);
      const repo = createMockRepo({
        findByEmail: jest.fn().mockResolvedValue({ ...mockUser, password_hash: hash }),
      });
      const service = new AuthService(repo);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' })
      ).rejects.toThrow('Email veya şifre hatalı');
    });

    it('should login successfully with correct credentials', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('correctpassword', 12);
      const repo = createMockRepo({
        findByEmail: jest.fn().mockResolvedValue({ ...mockUser, password_hash: hash }),
      });
      const service = new AuthService(repo);

      const result = await service.login({ email: 'test@test.com', password: 'correctpassword' });
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const repo = createMockRepo({
        findById: jest.fn().mockResolvedValue(mockUser),
      });
      const service = new AuthService(repo);

      const result = await service.getProfile('123');
      expect(result.full_name).toBe('Test User');
      expect((result as any).password_hash).toBeUndefined();
    });

    it('should throw error if user not found', async () => {
      const repo = createMockRepo();
      const service = new AuthService(repo);

      await expect(service.getProfile('999')).rejects.toThrow('Kullanıcı bulunamadı');
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const repo = createMockRepo({
        findById: jest.fn().mockResolvedValue(mockUser),
      });
      const service = new AuthService(repo);

      await expect(service.deleteAccount('123')).resolves.toBeUndefined();
      expect(repo.deleteById).toHaveBeenCalledWith('123');
    });

    it('should throw error if user not found', async () => {
      const repo = createMockRepo();
      const service = new AuthService(repo);

      await expect(service.deleteAccount('999')).rejects.toThrow('Kullanici bulunamadi');
    });
  });

  describe('getAllProviders', () => {
    it('should return list of providers', async () => {
      const providers = [
        { ...mockUser, id: '1', role: 'provider' as const },
        { ...mockUser, id: '2', role: 'provider' as const },
      ];
      const repo = createMockRepo({
        findByRole: jest.fn().mockResolvedValue(providers),
      });
      const service = new AuthService(repo);

      const result = await service.getAllProviders();
      expect(result).toHaveLength(2);
      expect(repo.findByRole).toHaveBeenCalledWith('provider');
    });
  });
});
