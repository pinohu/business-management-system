import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Allow API routes to handle their own authentication
  if (isApiRoute) {
    return NextResponse.next();
  }

  try {
    if (token) {
      // Verify token
      verify(token, JWT_SECRET);
      
      // Redirect to home if trying to access login page while authenticated
      if (isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (!isLoginPage) {
      // Redirect to login if no token and trying to access protected route
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    // Invalid token, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 