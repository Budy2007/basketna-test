import { galleryCards } from '../services/meal.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getMeals = asyncHandler(async (req, res) => {
  sendSuccess(res, await galleryCards(req.query, req.app.locals.today()));
});
