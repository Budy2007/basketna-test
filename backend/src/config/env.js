// Reads and checks the environment once at startup. Every other module gets its settings from the object
// loadEnv() returns (app.locals.config inside Express), never from process.env directly.
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  // The MongoDB Atlas connection string (Atlas > Connect > Drivers). Never commit the real one.
  MONGO_URI: z.string({ required_error: 'is required: put your MongoDB Atlas connection string in backend/.env' })
    .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb+srv:// (Atlas) or mongodb://'),
  CLIENT_URL: z.string().optional(), // comma-separated origins allowed by CORS (the Vite dev server)
});

/** Validated settings; throws with every problem listed when something is missing or wrong. */
export function loadEnv(source = process.env) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${problems}`);
  }
  const e = parsed.data;
  return Object.freeze({
    nodeEnv: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    port: e.PORT,
    mongoUri: e.MONGO_URI,
    clientUrls: (e.CLIENT_URL ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    rateLimit: e.NODE_ENV !== 'test',
  });
}
