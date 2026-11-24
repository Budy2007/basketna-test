# سلتنا · Basketna

[![CI](https://github.com/YOUR-ACCOUNT/basketna/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-ACCOUNT/basketna/actions/workflows/ci.yml)

Plan a week of Egyptian meals and see where the whole basket is cheapest, using dated prices from Cairo shops.

**Phase 1 features**

1. **Meals**: browse the meal catalogue with cost per serving at each shop, search by name, filter by breakfast, lunch or dinner, and sort by price, protein or calories.
2. **Prices**: the latest price of every staple at every shop, with its date, the cheapest shop highlighted, a food-group filter, and official reference prices.
3. **Weekly plan**: choose meals for 7 days (or copy Saturday to every day) and the household size, then see the week's total at each shop and which shop to buy from.

Arabic and English, right-to-left and left-to-right.

## Stack

MongoDB Atlas (Mongoose) · Express · React 18 + Redux Toolkit (RTK Query) · Node 22.9+ · Vite

```
backend/                 Express REST API (ES modules)
  src/app.js             security, CORS, parsing, routes, 404, errors
  src/server.js          checks the environment, connects to MongoDB, then listens
  src/config/            env.js (reads and checks .env), db.js (Mongoose connection)
  src/models/            one Mongoose model per file
  src/routes/            one Express Router per feature, under /api/v1
  src/controllers/       read the validated request, call services, send {success, data}
  src/services/          business logic and database work
  src/engine/core.js     pure price and basket calculations (no Express, no MongoDB)
  src/middleware/        validate, csrf, sanitize, rateLimit, notFound, errorHandler
  src/validators/        zod schemas for request bodies and queries
  test/                  node:test: engine tests and API tests (supertest)
client/                  React app
  src/pages/             Home, Plan, Meals, Prices
  src/components/        Analysis (plan results), MealCard
  src/store/             RTK Query API and the Redux store
  src/i18n/              Arabic and English text
data/egypt_cairo.json    seed data: shops, staples, meals and dated prices
```

## API

Full details: [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md). All responses are `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details?" } }`.
POST requests must send the header `X-Basketna: 1`.

| Method | Path | What it returns |
|---|---|---|
| GET | `/api/v1/meta` | settings, staples, meals, shops, slots, sorts |
| GET | `/api/v1/home` | stats and the 4 cheapest meals |
| GET | `/api/v1/health` | API and database status |
| GET | `/api/v1/meals?slot=&sort=&q=` | meal cards (`slot`: breakfast, lunch, dinner; `sort`: cheapest, protein, light, name; `q`: part of the name) |
| GET | `/api/v1/prices` | comparison shops, reference sources and the latest estimate per staple and shop |
| GET | `/api/v1/shops` | every shop with its number of prices and newest price date |
| POST | `/api/v1/planner/analyze` | body `{ plan: {"d0_breakfast": "ful_medames", ...}, people }` → totals per shop and the recommendation |

## Set up the database (MongoDB Atlas, free)

1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access** → add a database user with a password.
3. **Network Access** → add your IP address (for a class project you can allow `0.0.0.0/0`).
4. **Connect** → **Drivers** → copy the connection string.
5. Copy `backend/.env.example` to `backend/.env` and paste it as `MONGO_URI`, with your user and password,
   and `/basketna` before the `?`. Do the same for `TEST_MONGO_URI` with `/basketna_test`.
6. Load the data once: `cd backend` then `npm install` and `npm run seed`.

Each team member uses the same connection string in their own `backend/.env`. Never commit `.env`.

## Run it

```bash
cd backend
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 (Vite sends `/api` to the backend on port 3001).

To serve the built app from Express instead: `npm run build` in `client/`, then `npm start` in `backend/` and open http://localhost:3001.

## Tests

```bash
cd backend
npm test
```

```bash
cd client
npm test
```

The API tests use the database in `TEST_MONGO_URI` (its name must end with `_test`, because each run deletes everything in it).
Without it they use a local MongoDB at `mongodb://127.0.0.1:27017/basketna_test`.

GitHub Actions runs both test suites and the client build on every push and pull request ([.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Demo

The Phase 1 demo script is in [docs/DEMO.md](docs/DEMO.md).
