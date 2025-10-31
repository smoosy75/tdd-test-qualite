import { Request, Response } from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { signup, login } from '../controllers/auth.controller';
import pocketbaseService from '../services/pocketbase.service';

// Mock the PocketBase service
jest.mock('../services/pocketbase.service', () => ({
  __esModule: true,
  default: {
    createUser: jest.fn(),
    login: jest.fn(),
  },
}));

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: mockStatus as any,
      json: mockJson as any,
    };
  });

  describe('POST /auth/signup', () => {
    it('should create a user successfully with valid data', async () => {
      const mockUser = {
        id: 'u_123',
        email: 'test@example.com',
        username: 'testuser',
      };

      (pocketbaseService.createUser as any).mockResolvedValueOnce(mockUser);

      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      await signup(mockReq as Request, mockRes as Response);

      expect(pocketbaseService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 400 when fields are missing', async () => {
      mockReq.body = {
        email: 'incomplete@example.com',
      };

      await signup(mockReq as Request, mockRes as Response);

      expect(pocketbaseService.createUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Champs manquants' });
    });

    it('should return 500 when service throws an error', async () => {
      (pocketbaseService.createUser as any).mockRejectedValueOnce(
        new Error('Database error')
      );

      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      await signup(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResult = {
        token: 'jwt-123',
        user: { id: 'u1', email: 'test@example.com', username: 'tester' },
      };

      (pocketbaseService.login as any).mockResolvedValueOnce(mockResult);

      mockReq.body = {
        identity: 'test@example.com',
        password: 'Password123!',
      };

      await login(mockReq as Request, mockRes as Response);

      expect(pocketbaseService.login).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when fields are missing', async () => {
      mockReq.body = {
        identity: 'test@example.com',
      };

      await login(mockReq as Request, mockRes as Response);

      expect(pocketbaseService.login).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Champs manquants' });
    });

    it('should return 401 when credentials are invalid', async () => {
      (pocketbaseService.login as any).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      mockReq.body = {
        identity: 'test@example.com',
        password: 'wrong',
      };

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Identifiants invalides' });
    });

    it('should return 404 when user is not found', async () => {
      (pocketbaseService.login as any).mockRejectedValueOnce(
        new Error('User not found')
      );

      mockReq.body = {
        identity: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' });
    });

    it('should return 500 for unexpected errors', async () => {
      (pocketbaseService.login as any).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      mockReq.body = {
        identity: 'test@example.com',
        password: 'Password123!',
      };

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erreur interne' });
    });
  });
});
