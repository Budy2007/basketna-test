// Node 22+ has its own global localStorage (undefined without --localstorage-file) that hides
// jsdom's; put jsdom's back so tests see a working browser storage.
if (typeof localStorage === 'undefined' && globalThis.jsdom) {
  Object.defineProperty(globalThis, 'localStorage', { value: globalThis.jsdom.window.localStorage, configurable: true });
}
