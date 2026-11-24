// Builds and configures the Express app. It does not connect to MongoDB or listen; server.js does that.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { requireCsrfHeader } from './middleware/csrf.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { sanitizeRequest } from './middleware/sanitize.middleware.js';
import healthRoutes from './routes/health.routes.js';
import homeRoutes from './routes/home.routes.js';
import mealRoutes from './routes/meal.routes.js';
import metaRoutes from './routes/meta.routes.js';
import plannerRoutes from './routes/planner.routes.js';
import priceRoutes from './routes/price.routes.js';
import shopRoutes from './routes/shop.routes.js';
import { localToday } from './utils/dates.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(here, '..', '..', 'client', 'dist');

/** config: the object loadEnv() returns. options.today pins "today" (tests use a fixed date). */
export function createApp(config, { today = localToday } = {}) {
  const app = express();
  app.locals.config = config;
  app.locals.today = today;
  app.disable('x-powered-by');
  if (config.isProduction) app.set('trust proxy', 1); // behind one reverse proxy, so rate limits see real IPs

  // 1. Security headers
  app.use(helmet());
  // 2. CORS: only the React dev server's origins may call the API. Same-origin requests need no CORS.
  app.use(cors({ origin: config.clientUrls.length ? config.clientUrls : false }));
  // 3. Parsing
  app.use(express.json({ limit: '200kb' }));
  // 4. Global API protections
  app.use('/api', sanitizeRequest, apiLimiter(config.rateLimit), requireCsrfHeader);

  // 5. Routes
  app.use('/api/v1/meta', metaRoutes);
  app.use('/api/v1/home', homeRoutes);
  app.use('/api/v1/planner', plannerRoutes);
  app.use('/api/v1/meals', mealRoutes);
  app.use('/api/v1/prices', priceRoutes);
  app.use('/api/v1/shops', shopRoutes);
  app.use('/api/v1/health', healthRoutes);

  // 6. Unknown API paths
  app.use('/api', notFound);

  // The built React app, when present. React Router handles the other paths.
  if (existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
  }

  // 7. Errors
  app.use(errorHandler);
  return app;
}
