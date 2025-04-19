/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler
 * @param error Error object
 */
export const handleError = (error: any): void => {
  console.error('Error:', error.message);

  if (error instanceof AppError) {
    // Handle operational errors
    console.error(`Status Code: ${error.statusCode}`);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
};
