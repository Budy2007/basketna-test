// Request limit per IP for the API.
import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/** enabled is false in tests, where many requests come from one address. */
export function apiLimiter(enabled) {
  if (!enabled) return (_req, _res, next) => next();
  return rateLimit({
    windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, 'TOO_MANY_REQUESTS', 'Too many requests. Wait a minute and try again.')),
  });
}
