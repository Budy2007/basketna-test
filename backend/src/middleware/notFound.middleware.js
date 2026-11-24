// Any /api path that no router handled.
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`No endpoint ${req.method} ${req.originalUrl}`));
}
