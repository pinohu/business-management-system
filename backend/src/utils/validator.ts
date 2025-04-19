import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

// Validation result handler
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(errorMessages.join(', '), 400);
    }

    next();
  };
};

// Common validation rules
export const commonValidations = {
  // ID validation
  id: () => body('id')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID format'),

  // Email validation
  email: () => body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // Password validation
  password: () => body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),

  // String validation
  string: (field: string, minLength = 1, maxLength = 100) => body(field)
    .isString()
    .withMessage(`${field} must be a string`)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),

  // Number validation
  number: (field: string, min?: number, max?: number) => {
    const validation = body(field)
      .isNumeric()
      .withMessage(`${field} must be a number`);

    if (min !== undefined) {
      validation.isFloat({ min })
        .withMessage(`${field} must be greater than or equal to ${min}`);
    }

    if (max !== undefined) {
      validation.isFloat({ max })
        .withMessage(`${field} must be less than or equal to ${max}`);
    }

    return validation;
  },

  // Date validation
  date: (field: string) => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid date`),

  // Boolean validation
  boolean: (field: string) => body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean`),

  // Array validation
  array: (field: string, minLength = 1, maxLength = 100) => body(field)
    .isArray()
    .withMessage(`${field} must be an array`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must contain between ${minLength} and ${maxLength} items`),

  // Object validation
  object: (field: string) => body(field)
    .isObject()
    .withMessage(`${field} must be an object`),

  // URL validation
  url: (field: string) => body(field)
    .isURL()
    .withMessage(`${field} must be a valid URL`),

  // File validation
  file: (field: string, maxSize = 5242880, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']) => body(field)
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      if (req.file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      }

      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
      }

      return true;
    }),

  // Enum validation
  enum: (field: string, values: string[]) => body(field)
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Optional validation
  optional: (validation: ValidationChain) => validation.optional(),

  // Custom validation
  custom: (field: string, validator: (value: any) => boolean | Promise<boolean>, message: string) => body(field)
    .custom(validator)
    .withMessage(message)
};

// Request validation middleware
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validate(validations)(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Query parameter validation
export const validateQuery = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validate(validations.map(v => v.withOptions({ locations: ['query'] })))(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// URL parameter validation
export const validateParams = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validate(validations.map(v => v.withOptions({ locations: ['params'] })))(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Example usage:
/*
const userValidations = [
  commonValidations.email(),
  commonValidations.password(),
  commonValidations.string('name', 2, 50),
  commonValidations.optional(commonValidations.string('bio', 0, 500))
];

router.post('/users', validateRequest(userValidations), userController.create);
*/ 