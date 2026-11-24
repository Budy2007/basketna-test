import { expect, test } from 'vitest';
import { clampPeople, clearWeek, copyFirstDay } from './plan.js';

test('clear week returns an empty plan', () => {
  expect(clearWeek()).toEqual({});
});

test('copy Saturday fills every day with the same meals', () => {
  const week = copyFirstDay({ d0_breakfast: 'ful', d0_lunch: 'koshari', d3_dinner: 'soup' });
  for (let d = 0; d < 7; d++) {
    expect(week[`d${d}_breakfast`]).toBe('ful');
    expect(week[`d${d}_lunch`]).toBe('koshari');
  }
  // Saturday had no dinner, so no day keeps one
  expect(Object.keys(week).filter((k) => k.endsWith('_dinner'))).toEqual([]);
});

test('copy Saturday does not change the plan it was given', () => {
  const grid = { d0_lunch: 'koshari' };
  copyFirstDay(grid);
  expect(grid).toEqual({ d0_lunch: 'koshari' });
});

test('people are a whole number from 1 to 20', () => {
  expect(clampPeople('0', 4)).toBe(1);
  expect(clampPeople(-3, 4)).toBe(1);
  expect(clampPeople(25, 4)).toBe(20);
  expect(clampPeople('6', 4)).toBe(6);
  expect(clampPeople('', 4)).toBe(4);
  expect(clampPeople('abc', 4)).toBe(4);
  expect(clampPeople(null, 4)).toBe(4);
});
