import { expect, test } from 'vitest';
import { cheapestShops } from './prices.js';

const est = (unitPrice) => ({ unitPrice });
const shops = ['a', 'b', 'c'];

test('the lowest unit price wins', () => {
  const estimates = { 'rice|a': est(40), 'rice|b': est(34), 'rice|c': est(38) };
  expect(cheapestShops(estimates, 'rice', shops)).toEqual(['b']);
});

test('ties return every tied shop', () => {
  const estimates = { 'rice|a': est(34), 'rice|b': est(34), 'rice|c': est(38) };
  expect(cheapestShops(estimates, 'rice', shops)).toEqual(['a', 'b']);
});

test('shops without a price are skipped', () => {
  const estimates = { 'rice|a': est(40), 'rice|c': est(38) };
  expect(cheapestShops(estimates, 'rice', shops)).toEqual(['c']);
});

test('fewer than two prices means no highlight', () => {
  expect(cheapestShops({ 'rice|a': est(40) }, 'rice', shops)).toEqual([]);
  expect(cheapestShops({}, 'rice', shops)).toEqual([]);
});
