import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pinball-winnings/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
