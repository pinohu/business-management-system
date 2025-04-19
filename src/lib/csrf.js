import { NextResponse } from 'next/server';
import { csrf } from '@/lib/csrf-token';

export async function middleware(request) {
  // Skip CSRF check for GET requests and static files
  if (request.method === 'GET' || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  try {
    // Verify CSRF token
    await csrf.verify(request);
    return NextResponse.next();
  } catch (error) {
    return new NextResponse('Invalid CSRF token', { status: 403 });
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
    '/forms/:path*',
  ],
}; 