// The one place errors become responses: {success: false, error: {code, message, details?}}.
// Internal details are logged, and shown to the client only outside production.
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

function toApiError(err) {
  if (err instanceof ApiError) return err;
  if (err.type === 'entity.parse.failed') return ApiError.badRequest('The request body is not valid JSON');
  if (err.type === 'entity.too.large') return new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large');
  if (err instanceof mongoose.Error.CastError) return ApiError.badRequest(`Invalid ${err.path}`);
  if (err instanceof mongoose.Error.ValidationError) {
    return ApiError.validation('Some fields are invalid', Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })));
  }
  if (err.code === 11000) return ApiError.conflict('That value is already used', Object.keys(err.keyValue ?? {}).map((field) => ({ field, message: 'already used' })));
  return null;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const known = toApiError(err);
  const production = req.app.locals.config?.isProduction;
  if (!known) console.error(err);
  const e = known ?? new ApiError(500, 'SERVER_ERROR', production ? 'Something went wrong on the server' : err.message);
  res.status(e.status).json({ success: false, error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } });
}
