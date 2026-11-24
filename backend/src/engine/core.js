// Pure price, basket and nutrition logic. No Express or MongoDB here, so it is easy to test.

export const SLOTS = ['breakfast', 'lunch', 'dinner'];
export const DAYS = 7;
export const NUTRIENTS = ['kcal', 'protein_g', 'fat_g', 'carbs_g', 'fiber_g', 'iron_mg'];
const VEG_FRUIT_GROUPS = new Set(['vegetables', 'fruits']);

const DAY_MS = 24 * 3600 * 1000;
/** Whole days between two YYYY-MM-DD dates (b - a). */
export function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

export function unitPrice(packPrice, packSize) {
  if (!(packPrice > 0) || !(packSize > 0)) throw new RangeError('pack price and pack size must be positive');
  return packPrice / packSize;
}

/**
 * Latest observation per (staple, shop). The low/high range spans observations within twice the
 * staple's freshness window of the latest one. Future-dated observations are ignored.
 * observations: [{id, staple, shop, unitPrice, observedOn, isPromo, source, packSize, productTitle}]
 * Returns a Map keyed `${staple}|${shop}`.
 */
export function estimatePrices(observations, freshDays, today) {
  const groups = new Map();
  for (const o of observations) {
    if (o.observedOn <= today) {
      const key = `${o.staple}|${o.shop}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
  }
  const estimates = new Map();
  for (const [key, obs] of groups) {
    obs.sort((x, y) => (x.observedOn < y.observedOn ? -1 : x.observedOn > y.observedOn ? 1 : x.id - y.id));
    const latest = obs[obs.length - 1];
    const window = 2 * freshDays[latest.staple];
    const recent = obs.filter((o) => daysBetween(o.observedOn, latest.observedOn) <= window).map((o) => o.unitPrice);
    const age = daysBetween(latest.observedOn, today);
    estimates.set(key, {
      staple: latest.staple,
      shop: latest.shop,
      unitPrice: latest.unitPrice,
      low: Math.min(...recent),
      high: Math.max(...recent),
      observedOn: latest.observedOn,
      ageDays: age,
      stale: age > freshDays[latest.staple],
      isPromo: Boolean(latest.isPromo),
      source: latest.source,
      observationId: latest.id,
      packSize: latest.packSize ?? 1,
      productTitle: latest.productTitle ?? null,
    });
  }
  return estimates;
}

export const priceKey = (staple, shop) => `${staple}|${shop}`;

/** plan maps "day|slot" -> meal key (or null). Returns {staple: quantity for the week}. */
export function basketQuantities(plan, meals, people) {
  const qty = {};
  for (const mealKey of Object.values(plan)) {
    if (!mealKey) continue;
    for (const [staple, q] of Object.entries(meals[mealKey].ingredients)) qty[staple] = (qty[staple] ?? 0) + q * people;
  }
  return qty;
}

/** Cost of the week's ingredients at each shop. Complete baskets sort first, then by total. */
export function shopTotals(qty, shops, prices) {
  const results = shops.map((shop) => {
    let total = 0, low = 0, high = 0, freshValue = 0;
    const missing = [], stale = [], lines = {}, dates = [];
    for (const [staple, q] of Object.entries(qty)) {
      const est = prices.get(priceKey(staple, shop));
      if (!est) { missing.push(staple); continue; }
      const cost = est.unitPrice * q;
      lines[staple] = cost;
      total += cost; low += est.low * q; high += est.high * q;
      dates.push(est.observedOn);
      if (est.stale) stale.push(staple); else freshValue += cost;
    }
    return {
      shop, total, low, high, missing: missing.sort(), stale: stale.sort(),
      freshShare: total ? freshValue / total : 0,
      oldest: dates.length ? dates.sort()[0] : null,
      lines,
    };
  });
  results.sort((a, b) => a.missing.length - b.missing.length || a.total - b.total);
  return results;
}

/** Cheapest way to buy the basket across exactly two shops, each item at the cheaper one. */
export function bestSplit(qty, shops, prices, baseline) {
  let best = null;
  for (let i = 0; i < shops.length; i++) {
    for (let j = i + 1; j < shops.length; j++) {
      const pair = [shops[i], shops[j]];
      let total = 0, ok = true;
      const assignment = {};
      for (const [staple, q] of Object.entries(qty)) {
        const options = pair.filter((s) => prices.has(priceKey(staple, s)))
          .map((s) => [prices.get(priceKey(staple, s)).unitPrice * q, s])
          .sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
        if (!options.length) { ok = false; break; }
        total += options[0][0];
        assignment[staple] = options[0][1];
      }
      if (!ok || new Set(Object.values(assignment)).size < 2) continue;
      if (!best || total < best.total) best = { shops: pair, total, saving: baseline - total, assignment };
    }
  }
  return best;
}

/**
 * Name one shop only when it is clearly cheaper: its high estimate is below the runner-up's low
 * estimate and the saving clears minSavingPct. Shops being compared must have at least
 * minFreshShare of their basket value at fresh prices; otherwise the result is "stale". A two-shop
 * split is offered only when it saves enough to justify the second trip.
 */
export function recommend(qty, totals, prices, { minSavingPct, splitMinPct, splitMinEgp, minFreshShare = 0.9 }) {
  if (!Object.keys(qty).length) return { kind: 'empty', best: null, runnerUp: null, saving: 0, split: null };
  const complete = totals.filter((t) => !t.missing.length);
  if (!complete.length) return { kind: 'incomplete', best: totals[0] ?? null, runnerUp: null, saving: 0, split: null };
  const best = complete[0];
  const runner = complete[1] ?? null;
  const saving = runner ? runner.total - best.total : 0;
  if ([best, runner].some((t) => t && t.freshShare < minFreshShare)) {
    return { kind: 'stale', best, runnerUp: runner, saving, split: null };
  }
  const clear = !runner || (best.high < runner.low && saving >= (runner.total * minSavingPct) / 100);
  let split = bestSplit(qty, totals.map((t) => t.shop), prices, best.total);
  if (split && (split.saving < splitMinEgp || split.saving < (best.total * splitMinPct) / 100)) split = null;
  return { kind: clear ? 'single' : 'no_clear_winner', best, runnerUp: runner, saving, split };
}

/** Nutrients for one adult serving, plus the staples that had no nutrition data. */
export function servingNutrients(meal, staples) {
  const totals = Object.fromEntries(NUTRIENTS.map((n) => [n, 0]));
  totals.veg_fruit_g = 0;
  const unknown = [];
  for (const [key, q] of Object.entries(meal.ingredients)) {
    const staple = staples[key];
    if (!staple.gramsPerUnit || !staple.per100g || !Object.keys(staple.per100g).length) { unknown.push(key); continue; }
    const grams = q * staple.gramsPerUnit;
    for (const n of NUTRIENTS) totals[n] += (grams / 100) * (staple.per100g[n] ?? 0);
    if (VEG_FRUIT_GROUPS.has(staple.foodGroup)) totals.veg_fruit_g += grams;
  }
  totals.net_carbs_g = Math.max(0, totals.carbs_g - totals.fiber_g);
  return { totals, unknown };
}
