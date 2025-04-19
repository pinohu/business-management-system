import { NextResponse } from 'next/server';
import { cacheService } from './cache';
import { logger } from './logger';

export function middleware(request) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CORS Headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

class SecurityService {
  constructor() {
    this.cacheKey = 'security:';
    this.cacheTTL = 3600; // 1 hour
    this.securityConfig = {
      passwordMinLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      requireLowercase: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      sessionTimeout: 60, // minutes
      mfaRequired: true,
      encryptionKey: process.env.ENCRYPTION_KEY,
    };
  }

  async initialize() {
    try {
      await this.loadSecurityConfig();
      logger.info('Security service initialized successfully');
    } catch (error) {
      logger.error('Error initializing security service:', error);
      throw error;
    }
  }

  async loadSecurityConfig() {
    // Load security configuration from environment or database
    this.securityConfig = {
      ...this.securityConfig,
      ...(await this.getSecurityConfigFromDB()),
    };
  }

  async getSecurityConfigFromDB() {
    // Implement database configuration loading
    return {};
  }

  async validatePassword(password) {
    const requirements = {
      minLength: password.length >= this.securityConfig.passwordMinLength,
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumbers: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
    };

    const isValid = Object.values(requirements).every(Boolean);
    const feedback = Object.entries(requirements)
      .filter(([_, value]) => !value)
      .map(([key]) => this.getPasswordRequirementMessage(key));

    return {
      isValid,
      feedback,
      strength: this.calculatePasswordStrength(password),
    };
  }

  getPasswordRequirementMessage(requirement) {
    const messages = {
      minLength: `Password must be at least ${this.securityConfig.passwordMinLength} characters long`,
      hasSpecialChars: 'Password must contain at least one special character',
      hasNumbers: 'Password must contain at least one number',
      hasUppercase: 'Password must contain at least one uppercase letter',
      hasLowercase: 'Password must contain at least one lowercase letter',
    };
    return messages[requirement];
  }

  calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= this.securityConfig.passwordMinLength) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    return strength;
  }

  async encryptData(data) {
    try {
      // Implement encryption using the configured key
      return {
        encrypted: data,
        iv: '',
        salt: '',
      };
    } catch (error) {
      logger.error('Data encryption error:', error);
      throw error;
    }
  }

  async decryptData(encryptedData) {
    try {
      // Implement decryption using the configured key
      return encryptedData.encrypted;
    } catch (error) {
      logger.error('Data decryption error:', error);
      throw error;
    }
  }

  async generateToken(userId, options = {}) {
    const { expiresIn = '1h', type = 'access' } = options;
    try {
      // Implement JWT token generation
      return {
        token: '',
        expiresIn,
        type,
      };
    } catch (error) {
      logger.error('Token generation error:', error);
      throw error;
    }
  }

  async validateToken(token) {
    try {
      // Implement JWT token validation
      return {
        isValid: true,
        payload: {},
        error: null,
      };
    } catch (error) {
      logger.error('Token validation error:', error);
      throw error;
    }
  }

  async setupMFA(userId) {
    try {
      // Implement MFA setup
      return {
        secret: '',
        qrCode: '',
        backupCodes: [],
      };
    } catch (error) {
      logger.error('MFA setup error:', error);
      throw error;
    }
  }

  async verifyMFA(userId, code) {
    try {
      // Implement MFA verification
      return {
        isValid: true,
        error: null,
      };
    } catch (error) {
      logger.error('MFA verification error:', error);
      throw error;
    }
  }

  async checkLoginAttempts(userId) {
    const cacheKey = `${this.cacheKey}login:${userId}`;
    const attempts = await cacheService.get(cacheKey) || 0;

    if (attempts >= this.securityConfig.maxLoginAttempts) {
      const lockoutEnd = await cacheService.get(`${cacheKey}:lockout`);
      if (lockoutEnd && new Date(lockoutEnd) > new Date()) {
        return {
          locked: true,
          remainingTime: Math.ceil((new Date(lockoutEnd) - new Date()) / 60000),
        };
      }
    }

    return {
      locked: false,
      attempts,
    };
  }

  async recordLoginAttempt(userId, success) {
    const cacheKey = `${this.cacheKey}login:${userId}`;
    const attempts = await cacheService.get(cacheKey) || 0;

    if (success) {
      await cacheService.delete(cacheKey);
      await cacheService.delete(`${cacheKey}:lockout`);
    } else {
      const newAttempts = attempts + 1;
      await cacheService.set(cacheKey, newAttempts, this.securityConfig.lockoutDuration * 60);

      if (newAttempts >= this.securityConfig.maxLoginAttempts) {
        const lockoutEnd = new Date();
        lockoutEnd.setMinutes(lockoutEnd.getMinutes() + this.securityConfig.lockoutDuration);
        await cacheService.set(`${cacheKey}:lockout`, lockoutEnd, this.securityConfig.lockoutDuration * 60);
      }
    }
  }

  async validateSession(sessionId) {
    try {
      // Implement session validation
      return {
        isValid: true,
        userId: '',
        expiresAt: new Date(),
      };
    } catch (error) {
      logger.error('Session validation error:', error);
      throw error;
    }
  }

  async createSession(userId) {
    try {
      // Implement session creation
      return {
        sessionId: '',
        expiresAt: new Date(),
        metadata: {},
      };
    } catch (error) {
      logger.error('Session creation error:', error);
      throw error;
    }
  }

  async invalidateSession(sessionId) {
    try {
      // Implement session invalidation
      return true;
    } catch (error) {
      logger.error('Session invalidation error:', error);
      throw error;
    }
  }

  async scanFile(file) {
    try {
      // Implement file scanning for malware
      return {
        isClean: true,
        threats: [],
        scanTime: new Date(),
      };
    } catch (error) {
      logger.error('File scanning error:', error);
      throw error;
    }
  }

  async validateInput(input, type) {
    try {
      // Implement input validation and sanitization
      return {
        isValid: true,
        sanitized: input,
        errors: [],
      };
    } catch (error) {
      logger.error('Input validation error:', error);
      throw error;
    }
  }

  async checkCompliance(data, standards) {
    try {
      // Implement compliance checking
      return {
        compliant: true,
        violations: [],
        recommendations: [],
      };
    } catch (error) {
      logger.error('Compliance check error:', error);
      throw error;
    }
  }

  async generateAuditLog(action, userId, details) {
    try {
      // Implement audit log generation
      return {
        timestamp: new Date(),
        action,
        userId,
        details,
        ip: '',
        userAgent: '',
      };
    } catch (error) {
      logger.error('Audit log generation error:', error);
      throw error;
    }
  }

  async checkRateLimit(userId, action) {
    const cacheKey = `${this.cacheKey}rate:${userId}:${action}`;
    const attempts = await cacheService.get(cacheKey) || 0;

    if (attempts >= this.getRateLimit(action)) {
      return {
        allowed: false,
        remainingTime: await this.getRateLimitRemainingTime(cacheKey),
      };
    }

    await cacheService.set(cacheKey, attempts + 1, 60); // 1 minute window
    return {
      allowed: true,
      remainingAttempts: this.getRateLimit(action) - attempts - 1,
    };
  }

  getRateLimit(action) {
    const limits = {
      login: 5,
      passwordReset: 3,
      api: 100,
      fileUpload: 10,
    };
    return limits[action] || 10;
  }

  async getRateLimitRemainingTime(cacheKey) {
    const ttl = await cacheService.getTTL(cacheKey);
    return Math.ceil(ttl / 60); // Convert to minutes
  }
}

export const securityService = new SecurityService(); 