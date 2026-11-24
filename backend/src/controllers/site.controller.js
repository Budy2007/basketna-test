// Data every page needs (meta) and the home page.
import { SLOTS } from '../models/constants.js';
import { PriceObservation } from '../models/index.js';
import { getSettings, loadMeals, loadShops, loadStaples } from '../services/catalog.service.js';
import { cheapestCards, MEAL_SORTS } from '../services/meal.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getMeta = asyncHandler(async (_req, res) => {
  const [settings, staples, meals, shops] = await Promise.all([getSettings(), loadStaples(), loadMeals(), loadShops()]);
  sendSuccess(res, { settings, staples, meals, shops, slots: SLOTS, sorts: Object.keys(MEAL_SORTS) });
});

export const getHome = asyncHandler(async (req, res) => {
  const today = req.app.locals.today();
  const [comparisonShops, observations, meals, cheapCards] = await Promise.all([
    loadShops({ comparisonOnly: true }), PriceObservation.find({}, { shop: 1, observedOn: 1 }).lean(), loadMeals(),
    cheapestCards(today)]);
  const comparison = new Set(comparisonShops.map((s) => s.key));
  sendSuccess(res, {
    stats: { meals: Object.keys(meals).length,
      shops: new Set(observations.filter((o) => comparison.has(o.shop)).map((o) => o.shop)).size,
      prices: observations.length, latest: observations.map((o) => o.observedOn).sort().at(-1) ?? null },
    cheapCards,
  });
});
