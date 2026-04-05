import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://kgt.up.railway.app',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
