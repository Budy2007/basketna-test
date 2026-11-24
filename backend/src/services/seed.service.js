// Load a seed JSON file (shops, staples, meals, dated prices) into MongoDB. Safe to run again:
// existing records are updated and prices already loaded are skipped.
import { readFile } from 'node:fs/promises';
import { addObservation } from './price.service.js';
import { Meal, PriceObservation, Shop, Staple } from '../models/index.js';

export async function loadSeed(path) {
  const data = JSON.parse(await readFile(path, 'utf8'));
  for (const s of data.shops) {
    await Shop.updateOne({ key: s.key }, { $set: { nameAr: s.name_ar, nameEn: s.name_en, kind: s.kind,
      inComparison: s.in_comparison !== 0 && s.in_comparison !== false, website: s.website ?? null, notes: s.notes ?? null } },
    { upsert: true });
  }
  for (const s of data.staples) {
    await Staple.updateOne({ key: s.key }, { $set: { nameAr: s.name_ar, nameEn: s.name_en, unit: s.unit, foodGroup: s.food_group,
      freshDays: s.fresh_days, compare: s.compare !== false, gramsPerUnit: s.grams_per_unit ?? null,
      nutrition: s.nutrition ?? {}, nutritionSource: s.nutrition_source ?? null } }, { upsert: true });
  }
  for (const m of data.meals) {
    await Meal.updateOne({ key: m.key }, { $set: { nameAr: m.name_ar, nameEn: m.name_en, slot: m.slot, sourceUrl: m.source_url ?? null,
      ingredients: m.ingredients.map((i) => ({ staple: i.staple, qty: i.qty })) } }, { upsert: true });
  }
  let added = 0;
  for (const o of data.observations ?? []) {
    const exists = await PriceObservation.exists({ staple: o.staple, shop: o.shop, observedOn: o.observed_on,
      packPriceEgp: o.pack_price_egp, packSize: o.pack_size });
    if (exists) continue;
    await addObservation({ staple: o.staple, shop: o.shop, packSize: o.pack_size, packPrice: o.pack_price_egp,
      observedOn: o.observed_on, source: o.source, productTitle: o.product_title ?? null, isPromo: Boolean(o.is_promo),
      sourceUrl: o.source_url ?? null, notes: o.notes ?? null, collector: 'seed' });
    added += 1;
  }
  return { shops: data.shops.length, staples: data.staples.length, meals: data.meals.length, newObservations: added };
}
