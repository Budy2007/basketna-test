// The price log: reading observations, adding one, current estimates and the public price table.
import { estimatePrices, priceKey } from '../engine/core.js';
import { PriceObservation } from '../models/index.js';
import { freshDaysOf, loadShops, loadStaples } from './catalog.service.js';

/** Observations in insertion order; `id` is their position, used to break same-day ties. */
export async function loadObservations() {
  const rows = await PriceObservation.find().sort({ _id: 1 }).lean();
  return rows.map((r, i) => ({
    id: i, _id: r._id, staple: r.staple, shop: r.shop, unitPrice: r.unitPriceEgp, observedOn: r.observedOn,
    isPromo: r.isPromo, source: r.source, packSize: r.packSize, productTitle: r.productTitle ?? null,
  }));
}

export async function addObservation({ staple, shop, packSize, packPrice, observedOn, source, productTitle = null,
  isPromo = false, sourceUrl = null, collector = null, notes = null }) {
  if (!(packSize > 0) || !(packPrice > 0)) throw new RangeError('pack size and price must be positive');
  return PriceObservation.create({ staple, shop, packSize, packPriceEgp: packPrice, unitPriceEgp: packPrice / packSize,
    observedOn, source, productTitle, isPromo, sourceUrl, collector, notes });
}

/** The latest usable price of every staple at every shop on `today`: Map "staple|shop" -> estimate. */
export async function currentEstimates(today) {
  const [staples, observations] = await Promise.all([loadStaples(), loadObservations()]);
  return estimatePrices(observations, freshDaysOf(staples), today);
}

/** The public price table: comparison shops, reference sources, and every estimate. */
export async function priceTable(today) {
  const [staples, shops, estimates] = await Promise.all([loadStaples(), loadShops(), currentEstimates(today)]);
  const references = shops.filter((s) => !s.inComparison);
  return {
    shops: shops.filter((s) => s.inComparison), references,
    referenceKeys: Object.keys(staples).filter((k) => references.some((s) => estimates.has(priceKey(k, s.key)))),
    estimates: Object.fromEntries(estimates),
  };
}
