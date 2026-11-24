// Shops with how many prices each one has and the date of its newest price.
import { PriceObservation } from '../models/index.js';
import { loadShops } from './catalog.service.js';

export async function shopSummaries() {
  const [shops, counts] = await Promise.all([
    loadShops(),
    PriceObservation.aggregate([{ $group: { _id: '$shop', prices: { $sum: 1 }, latest: { $max: '$observedOn' } } }]),
  ]);
  const byShop = new Map(counts.map((c) => [c._id, c]));
  return shops.map((s) => ({
    key: s.key, nameAr: s.nameAr, nameEn: s.nameEn, kind: s.kind, website: s.website ?? null, inComparison: s.inComparison,
    prices: byShop.get(s.key)?.prices ?? 0,
    latest: byShop.get(s.key)?.latest ?? null,
  }));
}
