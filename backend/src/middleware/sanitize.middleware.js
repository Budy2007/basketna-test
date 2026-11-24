// Blocks NoSQL operator injection: drops any key that starts with "$" or contains "." from the body,
// query and route parameters before anything reaches a Mongoose query.

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('$') && !k.includes('.')).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  for (const part of ['body', 'query', 'params']) if (req[part]) req[part] = clean(req[part]);
  next();
}
