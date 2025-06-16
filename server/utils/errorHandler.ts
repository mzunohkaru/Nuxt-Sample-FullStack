export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function createErrorResponse(
  message: string,
  code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
  details?: any
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return createErrorResponse(error.message, error.code, error.details);
  }

  if (error instanceof Error) {
    return createErrorResponse(
      error.message,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }

  return createErrorResponse(
    'An unknown error occurred',
    ErrorCodes.INTERNAL_SERVER_ERROR
  );
}

export function createValidationError(message: string, details?: any): AppError {
  return new AppError(message, ErrorCodes.VALIDATION_ERROR, 400, details);
}

export function createAuthenticationError(message: string = 'Authentication required'): AppError {
  return new AppError(message, ErrorCodes.AUTHENTICATION_ERROR, 401);
}

export function createAuthorizationError(message: string = 'Access denied'): AppError {
  return new AppError(message, ErrorCodes.AUTHORIZATION_ERROR, 403);
}

export function createNotFoundError(message: string = 'Resource not found'): AppError {
  return new AppError(message, ErrorCodes.NOT_FOUND, 404);
}

export function createConflictError(message: string, details?: any): AppError {
  return new AppError(message, ErrorCodes.CONFLICT, 409, details);
}

export function createRateLimitError(message: string = 'Rate limit exceeded'): AppError {
  return new AppError(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429);
}

export function createMethodNotAllowedError(message: string = 'Method not allowed'): AppError {
  return new AppError(message, ErrorCodes.METHOD_NOT_ALLOWED, 405);
}