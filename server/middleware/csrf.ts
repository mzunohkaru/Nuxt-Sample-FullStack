import { createError } from 'h3';
import { createAuthorizationError } from '../utils/errorHandler';
import Logger from '../utils/logger';

const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-change-in-production';

export function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}:${random}:${CSRF_SECRET}`).toString('base64');
}

export function validateCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [timestamp, random, secret] = decoded.split(':');
    
    if (secret !== CSRF_SECRET) {
      return false;
    }

    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return tokenAge < maxAge;
  } catch {
    return false;
  }
}

export function csrfProtection(options: { 
  skipMethods?: string[];
  skipPaths?: string[];
} = {}) {
  const { 
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    skipPaths = []
  } = options;

  return async (event: any) => {
    const method = getMethod(event);
    const url = getRequestURL(event);
    const path = url.pathname;

    // Skip CSRF protection for safe methods
    if (skipMethods.includes(method)) {
      return;
    }

    // Skip CSRF protection for specified paths
    if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
      return;
    }

    const token = getHeader(event, CSRF_HEADER_NAME);
    
    if (!token) {
      Logger.warn('CSRF token missing', {
        method,
        path,
        ip: getClientIP(event),
      });
      
      throw createAuthorizationError('CSRF token required');
    }

    if (!validateCSRFToken(token)) {
      Logger.warn('Invalid CSRF token', {
        method,
        path,
        ip: getClientIP(event),
        token: token.substring(0, 10) + '...',
      });
      
      throw createAuthorizationError('Invalid CSRF token');
    }
  };
}

export default csrfProtection;