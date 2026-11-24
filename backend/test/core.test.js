// Engine tests: prices, basket totals, recommendation and nutrition per serving.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  basketQuantities, bestSplit, estimatePrices, recommend, servingNutrients, shopTotals, unitPrice,
} from '../src/engine/core.js';

const TODAY = '2026-10-24';
const FRESH = { rice: 30, tomatoes: 7, eggs: 14 };
const day = (d) => `2026-10-${String(d).padStart(2, '0')}`;
const obs = (id, staple, shop, price, d, extra = {}) => ({ id, staple, shop, unitPrice: price, observedOn: day(d), ...extra });
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const rules = { minSavingPct: 3, splitMinPct: 8, splitMinEgp: 100 };

test('unit price divides and rejects nonpositive', () => {
  assert.equal(unitPrice(90, 0.5), 180);
  assert.throws(() => unitPrice(0, 1));
  assert.throws(() => unitPrice(10, 0));
});

test('estimate uses latest, recent range, and flags stale', () => {
  const p = estimatePrices([obs(1, 'rice', 'a', 30, 1), obs(2, 'rice', 'a', 34, 20), obs(3, 'tomatoes', 'a', 20, 10),
    obs(4, 'tomatoes', 'a', 99, 30)], FRESH, TODAY);
  const rice = p.get('rice|a');
  assert.deepEqual([rice.unitPrice, rice.low, rice.high, rice.stale, rice.ageDays], [34, 30, 34, false, 4]);
  const tom = p.get('tomatoes|a');
  assert.deepEqual([tom.unitPrice, tom.stale, tom.ageDays], [20, true, 14]);
});

test('same-day ties go to the later entry', () => {
  assert.equal(estimatePrices([obs(5, 'eggs', 'a', 6, 22), obs(6, 'eggs', 'a', 7, 22)], FRESH, TODAY).get('eggs|a').unitPrice, 7);
});

const MEALS = {
  ful: { key: 'ful', slot: 'breakfast', ingredients: { eggs: 1, tomatoes: 0.1 } },
  rice_plate: { key: 'rice_plate', slot: 'lunch', ingredients: { rice: 0.15, tomatoes: 0.2 } },
};

test('basket quantities scale by people and skip empty slots', () => {
  const qty = basketQuantities({ '0|breakfast': 'ful', '0|lunch': 'rice_plate', '1|breakfast': 'ful', '1|lunch': null }, MEALS, 2);
  close(qty.eggs, 4); close(qty.tomatoes, 0.8); close(qty.rice, 0.3);
});

const prices = (rows) => estimatePrices(rows.map(([s, shop, p], i) => obs(i, s, shop, p, 22)), FRESH, TODAY);

test('shop totals put complete baskets first', () => {
  const t = shopTotals({ rice: 1, eggs: 10 }, ['a', 'b'], prices([['rice', 'a', 30], ['eggs', 'a', 6], ['rice', 'b', 20]]));
  assert.deepEqual(t.map((x) => x.shop), ['a', 'b']);
  assert.equal(t[0].total, 90); assert.deepEqual(t[1].missing, ['eggs']); assert.equal(t[1].total, 20);
});

test('fresh share counts only fresh value', () => {
  const p = estimatePrices([obs(1, 'rice', 'a', 30, 22), obs(2, 'tomatoes', 'a', 10, 1)], FRESH, TODAY);
  const t = shopTotals({ rice: 1, tomatoes: 1 }, ['a'], p)[0];
  assert.deepEqual(t.stale, ['tomatoes']); close(t.freshShare, 30 / 40); assert.equal(t.oldest, '2026-10-01');
});

test('recommend: clear winner, overlapping ranges, small saving, stale, incomplete, empty', () => {
  let p = prices([['rice', 'a', 30], ['rice', 'b', 36]]);
  let r = recommend({ rice: 10 }, shopTotals({ rice: 10 }, ['a', 'b'], p), p, rules);
  assert.deepEqual([r.kind, r.best.shop, r.saving], ['single', 'a', 60]);
  p = estimatePrices([obs(1, 'rice', 'a', 31, 10), obs(2, 'rice', 'a', 30, 22), obs(3, 'rice', 'b', 30.5, 22)], FRESH, TODAY);
  assert.equal(recommend({ rice: 10 }, shopTotals({ rice: 10 }, ['a', 'b'], p), p, { ...rules, minSavingPct: 0 }).kind, 'no_clear_winner');
  p = prices([['rice', 'a', 30], ['rice', 'b', 30.5]]);
  assert.equal(recommend({ rice: 10 }, shopTotals({ rice: 10 }, ['a', 'b'], p), p, rules).kind, 'no_clear_winner');
  p = estimatePrices([obs(1, 'tomatoes', 'a', 10, 1), obs(2, 'tomatoes', 'b', 20, 22)], FRESH, TODAY);
  r = recommend({ tomatoes: 10 }, shopTotals({ tomatoes: 10 }, ['a', 'b'], p), p, rules);
  assert.deepEqual([r.kind, r.best.shop], ['stale', 'a']);
  p = prices([['rice', 'a', 30]]);
  assert.equal(recommend({ rice: 1, eggs: 1 }, shopTotals({ rice: 1, eggs: 1 }, ['a'], p), p, rules).kind, 'incomplete');
  assert.equal(recommend({}, [], new Map(), rules).kind, 'empty');
});

test('split offered only when it saves enough', () => {
  const qty = { rice: 10, eggs: 60 };
  const p = prices([['rice', 'a', 30], ['eggs', 'a', 8], ['rice', 'b', 40], ['eggs', 'b', 6]]);
  const t = shopTotals(qty, ['a', 'b'], p);
  const split = bestSplit(qty, ['a', 'b'], p, t[0].total);
  assert.deepEqual(split.assignment, { rice: 'a', eggs: 'b' });
  assert.equal(split.total, 660);
  assert.ok(recommend(qty, t, p, rules).split);
  assert.equal(recommend(qty, t, p, { ...rules, splitMinEgp: 10000 }).split, null);
});

const STAPLES = {
  rice: { key: 'rice', unit: 'kg', foodGroup: 'grains', freshDays: 30, gramsPerUnit: 1000, per100g: { kcal: 360, protein_g: 7 } },
  tomatoes: { key: 'tomatoes', unit: 'kg', foodGroup: 'vegetables', freshDays: 7, gramsPerUnit: 1000, per100g: { kcal: 18, protein_g: 1 } },
  eggs: { key: 'eggs', unit: 'piece', foodGroup: 'protein', freshDays: 14, gramsPerUnit: null, per100g: {} },
};

test('nutrition per serving counts grams, vegetables and unknown staples', () => {
  const meal = { key: 'm', slot: 'lunch', ingredients: { rice: 0.15, tomatoes: 0.2, eggs: 2 } };
  const { totals, unknown } = servingNutrients(meal, STAPLES);
  close(totals.kcal, 150 * 3.6 + 200 * 0.18); close(totals.protein_g, 150 * 0.07 + 200 * 0.01);
  close(totals.veg_fruit_g, 200); assert.deepEqual(unknown, ['eggs']);
});
