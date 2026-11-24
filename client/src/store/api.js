// RTK Query: every call to the Basketna API (/api/v1). Responses arrive as {success, data}; the base query
// unwraps data so components get the payload. Every request sends the X-Basketna header the server requires
// on POST requests (its CSRF check).
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers) => { headers.set('X-Basketna', '1'); return headers; },
});

const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.data && typeof result.data === 'object' && 'success' in result.data) return { ...result, data: result.data.data };
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (b) => ({
    meta: b.query({ query: () => 'meta' }),
    home: b.query({ query: () => 'home' }),
    analyze: b.query({ query: (body) => ({ url: 'planner/analyze', method: 'POST', body }) }),
    meals: b.query({ query: (params) => ({ url: 'meals', params }) }),
    prices: b.query({ query: () => 'prices' }),
    shops: b.query({ query: () => 'shops' }),
  }),
});

export const { useMetaQuery, useHomeQuery, useAnalyzeQuery, useMealsQuery, usePricesQuery, useShopsQuery } = api;
