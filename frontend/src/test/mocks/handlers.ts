import { http, HttpResponse } from 'msw';
import { User } from '@/types/api';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface RequestContext {
  request: Request;
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }: RequestContext) => {
    const body = await request.json();
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        message: 'Login successful',
        token: 'mock-token',
        user: mockUser,
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }: RequestContext) => {
    const body = await request.json();
    if (body.email === 'existing@example.com') {
      return new HttpResponse(null, { status: 409 });
    }
    return HttpResponse.json({
      message: 'Registration successful',
      token: 'mock-token',
      user: mockUser,
    });
  }),

  http.get('/api/users/profile', async ({ request }: RequestContext) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== 'Bearer mock-token') {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(mockUser);
  }),

  http.patch('/api/users/profile', async ({ request }: RequestContext) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== 'Bearer mock-token') {
      return new HttpResponse(null, { status: 401 });
    }
    const body = await request.json();
    return HttpResponse.json({
      ...mockUser,
      ...body,
    });
  }),
];
