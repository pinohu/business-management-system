import { logger } from '../logger';
import { cacheService } from '../cache';
import config from '../../frontend/config';

class AuthMiddleware {
  constructor() {
    this.cache = cacheService;
    this.tokenKey = 'auth:token';
    this.refreshTokenKey = 'auth:refreshToken';
  }

  async authenticate(req, res, next) {
    try {
      // Check if authentication is required
      if (!config.security.authentication.enabled) {
        return next();
      }

      // Get token from header
      const token = this.extractToken(req);
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Validate token
      const isValid = await this.validateToken(token);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Add user info to request
      const userInfo = await this.getUserInfo(token);
      req.user = userInfo;

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  async authorize(roles) {
    return async (req, res, next) => {
      try {
        // Check if authorization is required
        if (!config.security.authorization.enabled) {
          return next();
        }

        // Check if user has required role
        if (!req.user || !req.user.role) {
          return res.status(403).json({ error: 'User role not found' });
        }

        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
      } catch (error) {
        logger.error('Authorization error:', error);
        res.status(403).json({ error: 'Authorization failed' });
      }
    };
  }

  async rateLimit(req, res, next) {
    try {
      // Check if rate limiting is enabled
      if (!config.security.rateLimiting.enabled) {
        return next();
      }

      const ip = req.ip;
      const key = `rate:${ip}`;

      // Get current request count
      const count = await this.cache.get(key) || 0;

      // Check if rate limit exceeded
      if (count >= config.security.rateLimiting.maxRequests) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }

      // Increment request count
      await this.cache.set(key, count + 1, config.security.rateLimiting.windowMs);

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next();
    }
  }

  async csrfProtection(req, res, next) {
    try {
      // Check if CSRF protection is enabled
      if (!config.security.csrfProtection) {
        return next();
      }

      // Skip CSRF check for GET requests
      if (req.method === 'GET') {
        return next();
      }

      // Get CSRF token from header
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }

      // Validate CSRF token
      const isValid = await this.validateCsrfToken(csrfToken);
      if (!isValid) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }

      next();
    } catch (error) {
      logger.error('CSRF protection error:', error);
      res.status(403).json({ error: 'CSRF protection failed' });
    }
  }

  // Helper methods
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== config.api.security.tokenPrefix) {
      return null;
    }

    return token;
  }

  async validateToken(token) {
    try {
      // Check cache first
      const cachedToken = await this.cache.get(this.tokenKey);
      if (cachedToken === token) {
        return true;
      }

      // Validate token with auth service
      const response = await fetch(`${config.api.baseURL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${config.api.security.tokenPrefix} ${token}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      // Cache valid token
      await this.cache.set(this.tokenKey, token, config.api.security.tokenExpiry);

      return true;
    } catch (error) {
      logger.error('Token validation error:', error);
      return false;
    }
  }

  async getUserInfo(token) {
    try {
      // Get user info from auth service
      const response = await fetch(`${config.api.baseURL}/auth/user`, {
        headers: {
          'Authorization': `${config.api.security.tokenPrefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      logger.error('Get user info error:', error);
      throw error;
    }
  }

  async validateCsrfToken(token) {
    try {
      // Validate CSRF token with auth service
      const response = await fetch(`${config.api.baseURL}/auth/csrf/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token,
        },
      });

      return response.ok;
    } catch (error) {
      logger.error('CSRF token validation error:', error);
      return false;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await this.cache.get(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Request new token
      const response = await fetch(`${config.api.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { token, newRefreshToken } = await response.json();

      // Cache new tokens
      await this.cache.set(this.tokenKey, token, config.api.security.tokenExpiry);
      await this.cache.set(
        this.refreshTokenKey,
        newRefreshToken,
        config.api.security.refreshTokenExpiry
      );

      return token;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}

export const authMiddleware = new AuthMiddleware(); 