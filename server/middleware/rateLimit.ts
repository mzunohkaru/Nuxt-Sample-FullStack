import { createRateLimitError } from '../utils/errorHandler';
import Logger from '../utils/logger';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export function createRateLimit(options: Partial<RateLimitOptions> = {}) {
  const config = { ...defaultOptions, ...options };

  return async (event: any) => {
    const ip = getClientIP(event) || 'unknown';
    const now = Date.now();
    const key = `rate_limit:${ip}`;

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      cleanupExpiredEntries(now);
    }

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    record.count++;
    store.set(key, record);

    // Add rate limit headers
    const remaining = Math.max(0, config.maxRequests - record.count);
    const resetTime = Math.ceil(record.resetTime / 1000);

    setHeader(event, 'X-RateLimit-Limit', config.maxRequests.toString());
    setHeader(event, 'X-RateLimit-Remaining', remaining.toString());
    setHeader(event, 'X-RateLimit-Reset', resetTime.toString());

    if (record.count > config.maxRequests) {
      Logger.warn('Rate limit exceeded', {
        ip,
        count: record.count,
        limit: config.maxRequests,
        url: getRequestURL(event).pathname,
      });

      throw createRateLimitError(config.message);
    }
  };
}

function cleanupExpiredEntries(now: number) {
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

// Predefined rate limiters for common use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded for this endpoint',
});

export default createRateLimit;