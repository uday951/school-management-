import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Resolve workspace packages directly from TypeScript source.
        // This way Vite compiles them itself — no need to pre-build.
        '@mahathi/types':      path.resolve(__dirname, '../../packages/types/src/index.ts'),
        '@mahathi/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
        '@mahathi/utils':      path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
