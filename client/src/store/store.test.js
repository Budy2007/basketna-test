import { beforeEach, expect, test } from 'vitest';
import { t } from '../i18n/index.js';
import { makeStore } from './index.js';
import { setLang, toggleLang } from './slices.js';

beforeEach(() => localStorage.clear());

test('the chosen language persists in localStorage', () => {
  const store = makeStore();
  store.dispatch(toggleLang());
  expect(makeStore().getState().ui.lang).toBe('en');
  store.dispatch(setLang('anything-else'));
  expect(makeStore().getState().ui.lang).toBe('ar');
});

test('broken saved state falls back to defaults', () => {
  localStorage.setItem('basketna-state', '{not json');
  expect(makeStore().getState().ui.lang).toBe('ar');
});

test('translations fill placeholders in both languages', () => {
  expect(t('rec_only', 'en', { shop: 'Shop A' })).toContain('Shop A');
  expect(t('rec_only', 'ar', { shop: 'Shop A' })).toContain('Shop A');
});
