// Defines custom error classes and error codes for the application.

export const ErrorCode = {
  // General Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  
  // Add other specific error codes here
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    this.name = 'AppError';
  }
}

// Utility function to generate a request ID
export function generateRequestId() {
    return 'req_' + Math.random().toString(36).substring(2, 15);
}