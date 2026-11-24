// Is the API up, and is it connected to MongoDB?
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/response.js';

export function getHealth(_req, res) {
  const connected = mongoose.connection.readyState === 1;
  sendSuccess(res, {
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
  }, connected ? 200 : 503);
}
