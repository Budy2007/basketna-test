// An error with an HTTP status and a stable code. Throw it anywhere; the error handler turns it into the
// standard JSON error response.
export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) { return new ApiError(400, 'BAD_REQUEST', message, details); }

  static notFound(message = 'Not found') { return new ApiError(404, 'NOT_FOUND', message); }

  static conflict(message, details) { return new ApiError(409, 'CONFLICT', message, details); }

  static validation(message, details) { return new ApiError(422, 'VALIDATION_ERROR', message, details); }
}
