// MongoDB connection through Mongoose. The server starts accepting requests only after connectDB() succeeds.
import mongoose from 'mongoose';

/** The URI without a password, for log lines. */
const safeUri = (uri) => uri.replace(/\/\/([^:/@]+):[^@]*@/, '//$1:***@');

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    throw new Error(`Cannot connect to MongoDB at ${safeUri(uri)}: ${error.message}`);
  }
  mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
