import { defineConfig } from 'vite';

// Vite config with proxy to our Node API on port 3001
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
