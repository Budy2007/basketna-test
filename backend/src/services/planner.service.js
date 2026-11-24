// Weekly planning: read a plan grid and work out what the week's basket costs at each shop and which shop
// to buy it from.
import {
  DAYS, SLOTS, basketQuantities, estimatePrices, priceKey, recommend, servingNutrients, shopTotals,
} from '../engine/core.js';
import { freshDaysOf, getSettings, loadMeals, loadShops, loadStaples } from './catalog.service.js';
import { loadObservations } from './price.service.js';

/** Read {"d<day>_<slot>": key} pairs, keeping only known meals in their own slot. Returns {"day|slot": key}. */
export function parsePlan(args, meals) {
  const plan = {};
  for (let day = 0; day < DAYS; day++) {
    for (const slot of SLOTS) {
      const key = args[`d${day}_${slot}`];
      if (key && meals[key] && meals[key].slot === slot) plan[`${day}|${slot}`] = key;
    }
  }
  return plan;
}

export function parsePeople(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : Math.min(Math.max(n, 1), 20);
}

/** Totals per comparison shop, the recommendation, and staples bought outside supermarkets (bread). */
export async function analyze(plan, people, today) {
  const [cfg, staples, meals, shops, observations] = await Promise.all([
    getSettings(), loadStaples(), loadMeals(), loadShops(), loadObservations()]);
  const comparison = shops.filter((s) => s.inComparison).map((s) => s.key);
  const prices = estimatePrices(observations, freshDaysOf(staples), today);
  const allQty = basketQuantities(plan, meals, people);
  const qty = Object.fromEntries(Object.entries(allQty).filter(([k]) => staples[k].compare));
  // Shops with no price for anything in this basket are left out rather than listed as all-missing.
  const totals = shopTotals(qty, comparison, prices).filter((x) => Object.keys(x.lines).length);
  const recommendation = recommend(qty, totals, prices, { minSavingPct: Number(cfg.min_saving_pct),
    splitMinPct: Number(cfg.split_min_pct), splitMinEgp: Number(cfg.split_min_egp) });
  const outside = [];
  for (const [key, q] of Object.entries(allQty)) {
    if (key in qty) continue;
    // Also show other staples bought the same way (subsidized bread next to free-market bread).
    const alike = new Set(Object.values(staples).filter((s) => !s.compare && s.unit === staples[key].unit).map((s) => s.key));
    const known = [...prices.values()].filter((e) => alike.has(e.staple)).sort((a, b) => a.unitPrice - b.unitPrice)
      .map((e) => ({ staple: e.staple, shop: e.shop, unitPrice: e.unitPrice }));
    outside.push({ staple: key, qty: q, unit: staples[key].unit, known });
  }
  return { plan, people, qty, totals, recommendation, outside, pricedOn: today };
}

/** meal key -> {shop: cost of one adult serving} for shops that price every compared ingredient (bread excluded). */
export function servingCosts(meals, staples, prices, shopKeys) {
  const costs = {};
  for (const [key, meal] of Object.entries(meals)) {
    const compared = Object.entries(meal.ingredients).filter(([s]) => staples[s].compare);
    costs[key] = {};
    if (!compared.length) continue;
    for (const shop of shopKeys) {
      if (compared.every(([s]) => prices.has(priceKey(s, shop)))) {
        costs[key][shop] = compared.reduce((sum, [s, q]) => sum + prices.get(priceKey(s, shop)).unitPrice * q, 0);
      }
    }
  }
  return costs;
}

/** Meals, their nutrition per serving and serving costs at each comparison shop. */
export async function planningInputs(today) {
  const [staples, meals, shops, observations] = await Promise.all([
    loadStaples(), loadMeals(), loadShops({ comparisonOnly: true }), loadObservations()]);
  const nutrition = Object.fromEntries(Object.entries(meals).map(([k, m]) => [k, servingNutrients(m, staples).totals]));
  const prices = estimatePrices(observations, freshDaysOf(staples), today);
  const shopKeys = shops.map((s) => s.key);
  return { staples, meals, prices, shops: shopKeys, nutrition, costs: servingCosts(meals, staples, prices, shopKeys) };
}
