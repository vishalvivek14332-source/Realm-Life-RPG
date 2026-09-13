import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Creates an in-memory sliding window rate limiter
 * @param windowMs Time frame in milliseconds
 * @param maxRequests Maximum allowed requests per window per IP
 * @param message Custom message returned when limit is exceeded
 */
export function createRateLimiter(
  windowMs: number = 5 * 60 * 1000,
  maxRequests: number = 20,
  message: string = 'Too many requests from this address. Please try again in a few minutes.'
) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically sweep old entries to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    let record = ipStore.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);

      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        message,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: retryAfterSeconds
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}
