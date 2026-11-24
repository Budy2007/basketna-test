// API tests through the full Express stack (middleware, validation, routes, controllers, services, models)
// against a separate test database. Set TEST_MONGO_URI (its name must end with _test, because every test run
// deletes all of its data); without it a local MongoDB is used, as in GitHub Actions.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { loadEnv } from '../src/config/env.js';
import { ensureSettings } from '../src/services/catalog.service.js';
import { loadSeed } from '../src/services/seed.service.js';

const TEST_URI = process.env.TEST_MONGO_URI ?? 'mongodb://127.0.0.1:27017/basketna_test';
const TODAY = '2026-10-24';
// A tiny synthetic dataset for tests only (not real prices).
const SEED = {
  shops: [
    { key: 'a', name_ar: 'محل أ', name_en: 'Shop A', kind: 'supermarket' },
    { key: 'b', name_ar: 'محل ب', name_en: 'Shop B', kind: 'discounter' },
    { key: 'gov', name_ar: 'سعر رسمي', name_en: 'Official', kind: 'government', in_comparison: 0 },
  ],
  staples: [
    { key: 'rice', name_ar: 'أرز', name_en: 'Rice', unit: 'kg', food_group: 'grains', fresh_days: 30, grams_per_unit: 1000, nutrition: { kcal: 360, protein_g: 7, fiber_g: 1 } },
    { key: 'lentils', name_ar: 'عدس', name_en: 'Lentils', unit: 'kg', food_group: 'legumes', fresh_days: 30, grams_per_unit: 1000, nutrition: { kcal: 350, protein_g: 24, fiber_g: 11 } },
    { key: 'tomatoes', name_ar: 'طماطم', name_en: 'Tomatoes', unit: 'kg', food_group: 'vegetables', fresh_days: 7, grams_per_unit: 1000, nutrition: { kcal: 18, protein_g: 1, fiber_g: 1.2 } },
    { key: 'eggs', name_ar: 'بيض', name_en: 'Eggs', unit: 'piece', food_group: 'protein', fresh_days: 14, grams_per_unit: 55, nutrition: { kcal: 143, protein_g: 12.6 } },
  ],
  meals: [
    { key: 'eggs_tomato', name_ar: 'بيض بالطماطم', name_en: 'Eggs with tomato', slot: 'breakfast', ingredients: [{ staple: 'eggs', qty: 2 }, { staple: 'tomatoes', qty: 0.1 }] },
    { key: 'rice_lentils', name_ar: 'أرز بالعدس', name_en: 'Rice with lentils', slot: 'lunch', ingredients: [{ staple: 'rice', qty: 0.12 }, { staple: 'lentils', qty: 0.06 }, { staple: 'tomatoes', qty: 0.15 }] },
    { key: 'lentil_soup', name_ar: 'شوربة عدس', name_en: 'Lentil soup', slot: 'dinner', ingredients: [{ staple: 'lentils', qty: 0.08 }, { staple: 'tomatoes', qty: 0.05 }] },
  ],
  observations: [['rice', 'a', 40], ['lentils', 'a', 70], ['tomatoes', 'a', 20], ['eggs', 'a', 7],
    ['rice', 'b', 34], ['lentils', 'b', 62], ['tomatoes', 'b', 18], ['eggs', 'b', 6], ['rice', 'gov', 30]]
    .map(([staple, shop, p]) => ({ staple, shop, pack_size: 1, pack_price_egp: p, observed_on: '2026-10-20', source: 'shop_visit' })),
};
const WEEK = {};
for (let d = 0; d < 7; d++) Object.assign(WEEK, { [`d${d}_breakfast`]: 'eggs_tomato', [`d${d}_lunch`]: 'rice_lentils', [`d${d}_dinner`]: 'lentil_soup' });

const config = loadEnv({ NODE_ENV: 'test', MONGO_URI: TEST_URI });
const app = createApp(config, { today: () => TODAY });
const API = '/api/v1';
const post = (url, body) => request(app).post(`${API}${url}`).set('X-Basketna', '1').send(body);

before(async () => {
  await connectDB(TEST_URI);
  const name = mongoose.connection.db.databaseName;
  if (!name.endsWith('_test')) throw new Error(`Refusing to run tests against "${name}": the database name must end with _test`);
  await mongoose.connection.dropDatabase();
  await ensureSettings();
  const seedPath = path.join(tmpdir(), 'basketna-phase1-test-seed.json');
  writeFileSync(seedPath, JSON.stringify(SEED));
  await loadSeed(seedPath);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('meta lists meals, staples, shops and slots', async () => {
  const res = await request(app).get(`${API}/meta`).expect(200);
  assert.equal(res.body.success, true);
  assert.deepEqual(Object.keys(res.body.data.meals).sort(), ['eggs_tomato', 'lentil_soup', 'rice_lentils']);
  assert.deepEqual(res.body.data.slots, ['breakfast', 'lunch', 'dinner']);
  assert.equal(res.body.data.shops.length, 3);
});

test('home shows stats and the cheapest meals', async () => {
  const { data } = (await request(app).get(`${API}/home`).expect(200)).body;
  assert.deepEqual(data.stats, { meals: 3, shops: 2, prices: 9, latest: '2026-10-20' });
  assert.ok(data.cheapCards.length > 0);
});

test('analyze: totals per shop and the cheaper shop recommended', async () => {
  const { data } = (await post('/planner/analyze', { plan: WEEK, people: 2 }).expect(200)).body;
  assert.equal(data.people, 2);
  assert.equal(Object.keys(data.plan).length, 21);
  assert.deepEqual(data.totals.map((t) => t.shop), ['b', 'a']);
  assert.ok(data.totals[0].total < data.totals[1].total);
  assert.equal(data.recommendation.best.shop, 'b');
});

test('analyze: empty plan, unknown meals and meals in the wrong slot are ignored', async () => {
  const { data } = (await post('/planner/analyze', { plan: { d0_breakfast: 'nope', d0_lunch: 'eggs_tomato' } }).expect(200)).body;
  assert.deepEqual(data.plan, {});
  assert.equal(data.recommendation.kind, 'empty');
  assert.equal(data.people, 4); // the default_people setting
});

test('analyze: people are clamped to 1..20', async () => {
  assert.equal((await post('/planner/analyze', { plan: WEEK, people: 99 })).body.data.people, 20);
  assert.equal((await post('/planner/analyze', { plan: WEEK, people: '0' })).body.data.people, 1);
});

test('meals: slot filter and sort', async () => {
  const { data } = (await request(app).get(`${API}/meals?slot=lunch&sort=protein`).expect(200)).body;
  assert.deepEqual(data.cards.map((c) => c.meal.key), ['rice_lentils']);
  assert.equal(data.sort, 'protein');
  const all = (await request(app).get(`${API}/meals?slot=bogus&sort=bogus`)).body.data;
  assert.equal(all.cards.length, 3);
  assert.equal(all.slot, null);
  assert.equal(all.sort, 'cheapest');
});

test('meals: search by name in English or Arabic, any case', async () => {
  const en = (await request(app).get(`${API}/meals?q=LENTIL`).expect(200)).body.data;
  assert.deepEqual(en.cards.map((c) => c.meal.key).sort(), ['lentil_soup', 'rice_lentils']);
  assert.equal(en.q, 'lentil');
  const ar = (await request(app).get(`${API}/meals?q=${encodeURIComponent('عدس')}&slot=dinner`)).body.data;
  assert.deepEqual(ar.cards.map((c) => c.meal.key), ['lentil_soup']);
  const none = (await request(app).get(`${API}/meals?q=pizza`)).body.data;
  assert.equal(none.cards.length, 0);
  await request(app).get(`${API}/meals?q=${'x'.repeat(51)}`).expect(422);
});

test('prices: comparison shops, reference sources and estimates', async () => {
  const { data } = (await request(app).get(`${API}/prices`).expect(200)).body;
  assert.deepEqual(data.shops.map((s) => s.key), ['a', 'b']);
  assert.deepEqual(data.references.map((s) => s.key), ['gov']);
  assert.deepEqual(data.referenceKeys, ['rice']);
  assert.equal(data.estimates['rice|b'].unitPrice, 34);
});

test('health reports the database', async () => {
  const { data } = (await request(app).get(`${API}/health`).expect(200)).body;
  assert.equal(data.status, 'ok');
  assert.equal(data.database, 'connected');
  assert.ok(Number.isInteger(data.uptimeSeconds));
});

test('shops: price counts and latest date', async () => {
  const { data } = (await request(app).get(`${API}/shops`).expect(200)).body;
  const by = Object.fromEntries(data.shops.map((s) => [s.key, s]));
  assert.deepEqual([by.a.prices, by.b.prices, by.gov.prices], [4, 4, 1]);
  assert.equal(by.a.latest, '2026-10-20');
  assert.equal(by.gov.inComparison, false);
});

test('errors: unknown endpoint, missing CSRF header, bad JSON, validation', async () => {
  const missing = await request(app).get(`${API}/nope`).expect(404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
  const csrf = await request(app).post(`${API}/planner/analyze`).send({ plan: WEEK }).expect(403);
  assert.equal(csrf.body.error.code, 'CSRF_FAILED');
  const bad = await request(app).post(`${API}/planner/analyze`).set('X-Basketna', '1').set('Content-Type', 'application/json').send('{bad').expect(400);
  assert.equal(bad.body.error.code, 'BAD_REQUEST');
  const invalid = await post('/planner/analyze', { plan: { d0_lunch: 5 } }).expect(422);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
});

test('NoSQL operators in the body are stripped', async () => {
  const res = await post('/planner/analyze', { plan: { $where: 'sleep(1000)', d0_lunch: 'rice_lentils' } }).expect(200);
  assert.deepEqual(res.body.data.plan, { '0|lunch': 'rice_lentils' });
});

test('environment: a missing MONGO_URI is reported', () => {
  assert.throws(() => loadEnv({}), /MONGO_URI/);
  assert.throws(() => loadEnv({ MONGO_URI: 'http://wrong' }), /MONGO_URI/);
});
