// CSRF protection: every state-changing request must carry X-Basketna: 1.
// A browser cannot add a custom header to a cross-site request without a CORS preflight, and CORS only
// admits the origins in CLIENT_URL.
import { ApiError } from '../utils/ApiError.js';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export function requireCsrfHeader(req, _res, next) {
  if (SAFE.has(req.method) || req.get('X-Basketna') === '1') return next();
  next(new ApiError(403, 'CSRF_FAILED', 'Missing X-Basketna header'));
}
