// The Redux store. The chosen language is kept in this browser's localStorage only (never on the server).
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api.js';
import { uiSlice } from './slices.js';

const KEY = 'basketna-state';

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return saved ? { ui: { ...uiSlice.getInitialState(), ...saved.ui } } : undefined;
  } catch {
    return undefined;
  }
}

export function makeStore(preloadedState = loadSaved()) {
  const store = configureStore({
    reducer: { ui: uiSlice.reducer, [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
    // RTK's default batches query updates until the next animation frame, which never comes in a
    // background tab; a microtask tick works everywhere.
    enhancers: (getDefault) => getDefault({ autoBatch: { type: 'tick' } }),
    preloadedState,
  });
  store.subscribe(() => {
    const { ui } = store.getState();
    try { localStorage.setItem(KEY, JSON.stringify({ ui })); } catch { /* private window: the choice just won't persist */ }
  });
  return store;
}
