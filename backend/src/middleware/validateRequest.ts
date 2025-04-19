import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error:', {
        errors: errors.array()
      });

      return next(new AppError('Validation failed', 400));
    }

    next();
  };
};

// Common validation rules
export const commonValidations = {
  id: (field: string = 'id'): ValidationChain => {
    return validationResult(field)
      .isMongoId()
      .withMessage('Invalid ID format');
  },

  email: (field: string = 'email'): ValidationChain => {
    return validationResult(field)
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail();
  },

  password: (field: string = 'password'): ValidationChain => {
    return validationResult(field)
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter');
  },

  string: (field: string, min: number = 1, max: number = 100): ValidationChain => {
    return validationResult(field)
      .isString()
      .withMessage('Must be a string')
      .trim()
      .isLength({ min, max })
      .withMessage(`Must be between ${min} and ${max} characters`);
  },

  number: (field: string, min?: number, max?: number): ValidationChain => {
    let validation = validationResult(field)
      .isNumeric()
      .withMessage('Must be a number');

    if (min !== undefined) {
      validation = validation.isInt({ min });
    }

    if (max !== undefined) {
      validation = validation.isInt({ max });
    }

    return validation;
  },

  date: (field: string): ValidationChain => {
    return validationResult(field)
      .isISO8601()
      .withMessage('Invalid date format');
  },

  boolean: (field: string): ValidationChain => {
    return validationResult(field)
      .isBoolean()
      .withMessage('Must be a boolean');
  },

  array: (field: string, min: number = 1, max: number = 100): ValidationChain => {
    return validationResult(field)
      .isArray()
      .withMessage('Must be an array')
      .isLength({ min, max })
      .withMessage(`Array must contain between ${min} and ${max} items`);
  },

  object: (field: string): ValidationChain => {
    return validationResult(field)
      .isObject()
      .withMessage('Must be an object');
  }
}; 