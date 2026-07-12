import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // In dev, proxy /api to the local backend (or production if VITE_API_URL is set)
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    // In production, VITE_API_URL is baked in at build time via import.meta.env
    define: {},
  };
});
