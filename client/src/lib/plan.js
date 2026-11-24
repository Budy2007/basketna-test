// Weekly plan helpers. A plan grid looks like {"d0_breakfast": "ful_medames", ..., "d6_dinner": "koshari"};
// day 0 is Saturday.
export const DAYS = 7;
export const SLOTS = ['breakfast', 'lunch', 'dinner'];

/** An empty week. */
export function clearWeek() {
  return {};
}

/** Saturday's meals copied to Sunday–Friday, slot by slot. An empty Saturday slot empties that slot all week. */
export function copyFirstDay(grid) {
  const next = { ...grid };
  for (let day = 1; day < DAYS; day++) {
    for (const slot of SLOTS) {
      const meal = grid[`d0_${slot}`];
      if (meal) next[`d${day}_${slot}`] = meal;
      else delete next[`d${day}_${slot}`];
    }
  }
  return next;
}

/** Household size from a form field or URL: whole number 1–20. Empty or not a number gives the fallback. */
export function clampPeople(value, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), 20);
}
