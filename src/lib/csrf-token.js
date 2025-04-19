import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export const csrf = {
  generateToken() {
    const token = randomBytes(32).toString('hex');
    const hash = createHash('sha256')
      .update(token)
      .digest('hex');
    
    return { token, hash };
  },

  async verify(request) {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken) {
      throw new Error('Missing CSRF token');
    }

    const cookieHash = createHash('sha256')
      .update(cookieToken)
      .digest('hex');

    if (cookieHash !== headerToken) {
      throw new Error('Invalid CSRF token');
    }
  },

  setToken(response) {
    const { token, hash } = this.generateToken();
    
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return hash;
  },
}; 