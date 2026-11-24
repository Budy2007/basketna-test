// Meal cards for the gallery and home page: cost per serving at each shop and nutrition per serving.
import { SLOTS } from '../models/constants.js';
import { planningInputs } from './planner.service.js';

export const MEAL_SORTS = {
  cheapest: (a, b) => (a.bestCost == null) - (b.bestCost == null) || (a.bestCost ?? 0) - (b.bestCost ?? 0),
  protein: (a, b) => b.proteinG - a.proteinG,
  light: (a, b) => a.kcal - b.kcal,
  name: (a, b) => a.meal.nameEn.localeCompare(b.meal.nameEn),
};

export async function mealCards(today) {
  const { meals, nutrition, costs } = await planningInputs(today);
  return Object.values(meals).map((meal) => {
    const ranked = Object.entries(costs[meal.key]).sort((a, b) => a[1] - b[1]).map(([shop, cost]) => ({ shop, cost }));
    const n = nutrition[meal.key];
    return { meal, kcal: n.kcal, proteinG: n.protein_g, netCarbsG: n.net_carbs_g,
      bestShop: ranked[0]?.shop ?? null, bestCost: ranked[0]?.cost ?? null, costs: ranked };
  });
}

/** The gallery: an unknown slot means "all", an unknown sort means cheapest first, and q matches part of the name. */
export async function galleryCards(query, today) {
  const slot = SLOTS.includes(query.slot) ? query.slot : null;
  const sort = query.sort in MEAL_SORTS ? query.sort : 'cheapest';
  const q = (query.q ?? '').trim().toLowerCase();
  const matches = (meal) => !q || meal.nameEn.toLowerCase().includes(q) || meal.nameAr.includes(q);
  const cards = (await mealCards(today)).filter((c) => (!slot || c.meal.slot === slot) && matches(c.meal)).sort(MEAL_SORTS[sort]);
  return { cards, slot, sort, q: q || null };
}

/** The cheapest priced meals, for the home page. */
export async function cheapestCards(today, count = 4) {
  return (await mealCards(today)).filter((c) => c.bestCost != null).sort(MEAL_SORTS.cheapest).slice(0, count);
}
