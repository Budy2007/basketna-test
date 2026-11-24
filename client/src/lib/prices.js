// Price table helpers.

/**
 * The shops with the lowest unit price for one staple. Ties return every tied shop.
 * Returns [] when fewer than two shops have a price, because "cheapest" means nothing then.
 * estimates: {"staple|shop": {unitPrice, ...}} from GET /api/v1/prices.
 */
export function cheapestShops(estimates, stapleKey, shopKeys) {
  const priced = shopKeys.map((shop) => [shop, estimates[`${stapleKey}|${shop}`]]).filter(([, est]) => est);
  if (priced.length < 2) return [];
  const lowest = Math.min(...priced.map(([, est]) => est.unitPrice));
  return priced.filter(([, est]) => Math.abs(est.unitPrice - lowest) < 1e-9).map(([shop]) => shop);
}
