// Shops and the freshness of their prices.
import { shopSummaries } from '../services/shop.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getShops = asyncHandler(async (_req, res) => {
  sendSuccess(res, { shops: await shopSummaries() });
});
