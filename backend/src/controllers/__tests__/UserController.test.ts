import { Request, Response } from 'express';
import { UserController } from '../UserController';
import { UserService } from '../../services/UserService';
import jwt from 'jsonwebtoken';

jest.mock('../../services/UserService');
jest.mock('jsonwebtoken');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockUserService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn()
    } as any;

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {};
    mockRes = {
      status: mockStatus,
      json: mockJson
    };

    userController = new UserController(mockUserService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const createdUser = {
        id: '1',
        ...userData,
        role: 'user'
      };

      mockUserService.createUser.mockResolvedValue(createdUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await userController.register(mockReq as Request, mockRes as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'mock-token',
        user: expect.objectContaining({
          email: userData.email,
          name: userData.name
        })
      });
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      mockUserService.createUser.mockRejectedValue(new Error('Email already exists'));

      await userController.register(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Email already exists'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = {
        id: '1',
        email: loginData.email,
        name: 'Test User',
        role: 'user'
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await userController.login(mockReq as Request, mockRes as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUserService.validatePassword).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mock-token',
        user: expect.objectContaining({
          email: user.email,
          name: user.name
        })
      });
    });

    it('should handle invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockUserService.findByEmail.mockResolvedValue(null);

      await userController.login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });
  });
});
