// The public price table.
import { priceTable } from '../services/price.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getPriceTable = asyncHandler(async (req, res) => {
  sendSuccess(res, await priceTable(req.app.locals.today()));
});
