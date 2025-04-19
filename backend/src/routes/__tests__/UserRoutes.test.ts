import request from 'supertest';
import express from 'express';
import { UserRoutes } from '../UserRoutes';
import { UserController } from '../../controllers/UserController';
import { UserService } from '../../services/UserService';
import { authMiddleware } from '../../middleware/auth';

jest.mock('../../controllers/UserController');
jest.mock('../../middleware/auth');

describe('UserRoutes', () => {
  let app: express.Application;
  let mockUserController: jest.Mocked<UserController>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockUserController = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      deleteProfile: jest.fn()
    } as any;

    const userService = new UserService();
    const userController = new UserController(userService);
    const userRoutes = new UserRoutes(userController);

    app.use('/api/users', userRoutes.router);
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should handle invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });

    it('should get user profile when authenticated', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };

      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual(mockUser);
    });
  });
});
