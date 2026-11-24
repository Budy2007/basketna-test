# Basketna API contracts (v1)

Base path: `/api/v1`. Bodies are JSON.

## Conventions

**Success**: `{ "success": true, "data": <payload> }`

**Error**: `{ "success": false, "error": { "code": "...", "message": "...", "details": [{ "field": "query.q", "message": "..." }] } }`
(`details` only for validation errors)

| Status | Code | When |
|---|---|---|
| 400 | `BAD_REQUEST` | The body is not valid JSON |
| 403 | `CSRF_FAILED` | A POST, PUT, PATCH or DELETE without the header `X-Basketna: 1` |
| 404 | `NOT_FOUND` | Unknown endpoint |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 200 KB |
| 422 | `VALIDATION_ERROR` | A field has the wrong type or is too long |
| 429 | `TOO_MANY_REQUESTS` | More than 300 requests a minute from one IP |
| 500 | `SERVER_ERROR` | Unexpected; the message is generic in production |
| 503 | (health only) | The API is up but not connected to MongoDB |

Keys starting with `$` or containing `.` are removed from every body and query (NoSQL injection protection).

**Plan grid** (used by the planner): `{ "d0_breakfast": "ful_medames", "d0_lunch": "koshari", ... }`, days 0–6 (Saturday first),
slots `breakfast`, `lunch`, `dinner`. Unknown meals, or meals in the wrong slot, are ignored.

---

## GET `/health`
API and database status.
- 200: `{ status: "ok", database: "connected", uptimeSeconds }`
- 503: `{ status: "degraded", database: "disconnected", uptimeSeconds }`

## GET `/meta`
Everything the pages need once.
- 200: `{ settings: { key: string }, staples: { key: Staple }, meals: { key: Meal }, shops: [Shop], slots: [string], sorts: [string] }`

## GET `/home`
- 200: `{ stats: { meals, shops, prices, latest }, cheapCards: [MealCard] }` (the 4 cheapest priced meals)

## GET `/meals`
The meal gallery.
- Query (all optional): `slot` = breakfast | lunch | dinner; `sort` = cheapest | protein | light | name;
  `q` = part of the Arabic or English name, any case, max 50 characters. Unknown `slot` or `sort` values mean "all" and "cheapest".
- 200: `{ cards: [{ meal, kcal, proteinG, netCarbsG, bestShop, bestCost, costs: [{ shop, cost }] }], slot, sort, q }`
- 422: `q` longer than 50 characters

## GET `/prices`
Latest price of every staple at every shop.
- 200: `{ shops: [Shop], references: [Shop], referenceKeys: [stapleKey],
  estimates: { "staple|shop": { unitPrice, low, high, observedOn, ageDays, stale, isPromo, packSize, productTitle } } }`

## GET `/shops`
Every shop with how many prices it has and its newest price date.
- 200: `{ shops: [{ key, nameAr, nameEn, kind, website, inComparison, prices, latest }] }`

## POST `/planner/analyze`
What the week's basket costs at each shop, and which shop to buy from. Nothing is stored.
- Header: `X-Basketna: 1`
- Body: `{ plan: PlanGrid, people?: 1–20 }` (out-of-range values are clamped; missing uses the `default_people` setting)
- 200: `{ plan: { "day|slot": mealKey }, people, qty: { staple: amount },
  totals: [{ shop, total, low, high, freshShare, oldest, missing: [staple], stale: [staple], lines }],
  recommendation: { kind: "single" | "no_clear_winner" | "stale" | "incomplete" | "empty", best?, runnerUp?, saving?, split? },
  outside: [{ staple, qty, unit, known: [{ staple, shop, unitPrice }] }], pricedOn }`
- 400 bad JSON, 403 missing header, 422 a plan value that is not text
