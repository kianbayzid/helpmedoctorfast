import { ApiError } from '../types';

export class ErrorHandler {
  static handle(error: ApiError): string {
    switch (error.status) {
      case 400:
        return error.message || 'Bad request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  static isNetworkError(error: ApiError): boolean {
    return error.status === 0 || error.message.includes('Network Error');
  }

  static isAuthError(error: ApiError): boolean {
    return error.status === 401 || error.status === 403;
  }

  static isValidationError(error: ApiError): boolean {
    return error.status === 400 || error.status === 422;
  }
}