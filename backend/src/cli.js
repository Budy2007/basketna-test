// Command line: load the seed data into the database in MONGO_URI.
//   node src/cli.js seed <path>
import { connectDB, disconnectDB } from './config/db.js';
import { loadEnv } from './config/env.js';
import { ensureSettings } from './services/catalog.service.js';
import { loadSeed } from './services/seed.service.js';

const [command, ...args] = process.argv.slice(2);

try {
  const config = loadEnv();
  await connectDB(config.mongoUri);
  await ensureSettings();
  if (command === 'seed') {
    console.log(await loadSeed(args[0] ?? '../data/egypt_cairo.json'));
  } else {
    console.error('usage: cli.js seed <path>');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
