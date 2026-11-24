import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on :3001 (or API_PORT) and Vite proxies /api to it, so the app and API share an origin.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': `http://localhost:${process.env.API_PORT ?? 3001}` } },
  test: { environment: 'jsdom', setupFiles: ['src/test-setup.js'] },
});
