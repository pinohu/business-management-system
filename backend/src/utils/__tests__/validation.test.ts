import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateUserInput,
  validateLoginInput,
  validateRegistrationInput,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong password', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('StrongP@ssw0rd')).toBe(true);
      expect(validatePassword('Complex!Pass123')).toBe(true);
    });

    it('rejects weak password', () => {
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('Pass123')).toBe(false);
      expect(validatePassword('Password!')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('validates correct name format', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('Mary-Jane')).toBe(true);
      expect(validateName('O\'Connor')).toBe(true);
    });

    it('rejects invalid name format', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('123')).toBe(false);
      expect(validateName('John@Doe')).toBe(false);
    });
  });

  describe('validateUserInput', () => {
    it('validates correct user input', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongP@ssw0rd',
      };

      const result = validateUserInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid user input', () => {
      const input = {
        name: '123',
        email: 'invalid-email',
        password: 'weak',
      };

      const result = validateUserInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Invalid name format');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('validateLoginInput', () => {
    it('validates correct login input', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = validateLoginInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid login input', () => {
      const input = {
        email: 'invalid-email',
        password: 'weak',
      };

      const result = validateLoginInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('handles missing fields', () => {
      const input = {
        email: 'test@example.com',
      };

      const result = validateLoginInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('validateRegistrationInput', () => {
    it('validates correct registration input', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongP@ssw0rd',
        confirmPassword: 'StrongP@ssw0rd',
      };

      const result = validateRegistrationInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid registration input', () => {
      const input = {
        name: '123',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
      };

      const result = validateRegistrationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('Invalid name format');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Passwords do not match');
    });

    it('handles missing fields', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      const result = validateRegistrationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });
  });
});
