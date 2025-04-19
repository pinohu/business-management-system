import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        message: 'User registered successfully',
      })
    );
  }),

  // User endpoints
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        profile: {
          bio: 'Test bio',
          avatar: 'https://example.com/avatar.jpg',
        },
      })
    );
  }),

  // Form endpoints
  rest.post('/api/forms/submit', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Form submitted successfully',
        data: req.body,
      })
    );
  }),

  // Error handling
  rest.get('/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        message: 'Internal server error',
        error: 'Test error message',
      })
    );
  }),
];

export const server = setupServer(...handlers); 