// Starts the API: check the environment, connect to MongoDB, then listen.
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { loadEnv } from './config/env.js';
import { ensureSettings } from './services/catalog.service.js';

async function start() {
  const config = loadEnv();
  await connectDB(config.mongoUri);
  await ensureSettings();

  const server = createApp(config).listen(config.port, () => {
    console.log(`Basketna API on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // do not hang on open connections
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
