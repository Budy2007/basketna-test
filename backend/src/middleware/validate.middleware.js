// Runs zod schemas from validators/ against the request and replaces each part with the parsed value, so
// controllers only see known, typed fields (unknown fields are dropped, which also blocks mass assignment).
import { ApiError } from '../utils/ApiError.js';

const PARTS = ['params', 'query', 'body'];

/** validate({body, query, params}): each a zod schema; missing parts are not checked. */
export const validate = (schemas) => (req, _res, next) => {
  const details = [];
  for (const part of PARTS) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (result.success) req[part] = result.data;
    else details.push(...result.error.issues.map((i) => ({ field: [part, ...i.path].join('.'), message: i.message })));
  }
  next(details.length ? ApiError.validation('Some fields are missing or invalid', details) : undefined);
};
