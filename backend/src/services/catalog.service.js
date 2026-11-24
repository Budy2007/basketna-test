// Reference data: settings, shops, staples and meals, turned into the plain objects the engine works with.
import { DEFAULT_SETTINGS, Meal, Setting, Shop, Staple } from '../models/index.js';

export async function ensureSettings() {
  await Promise.all(Object.entries(DEFAULT_SETTINGS).map(([key, value]) =>
    Setting.updateOne({ key }, { $setOnInsert: { value } }, { upsert: true })));
}

export async function getSettings() {
  const rows = await Setting.find().lean();
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export async function loadStaples() {
  const rows = await Staple.find().sort({ _id: 1 }).lean();
  return Object.fromEntries(rows.map((r) => [r.key, {
    key: r.key, nameAr: r.nameAr, nameEn: r.nameEn, unit: r.unit, foodGroup: r.foodGroup, freshDays: r.freshDays,
    gramsPerUnit: r.gramsPerUnit ?? null, compare: r.compare !== false,
    per100g: Object.fromEntries(Object.entries(r.nutrition ?? {}).filter(([, v]) => v != null)),
  }]));
}

export async function loadShops({ comparisonOnly = false } = {}) {
  return Shop.find(comparisonOnly ? { inComparison: true } : {}).sort({ _id: 1 }).lean();
}

export async function loadMeals() {
  const rows = await Meal.find().sort({ slot: 1, _id: 1 }).lean();
  return Object.fromEntries(rows.map((m) => [m.key, {
    key: m.key, nameAr: m.nameAr, nameEn: m.nameEn, slot: m.slot,
    ingredients: Object.fromEntries(m.ingredients.map((i) => [i.staple, i.qty])),
  }]));
}

export const freshDaysOf = (staples) => Object.fromEntries(Object.values(staples).map((s) => [s.key, s.freshDays]));
