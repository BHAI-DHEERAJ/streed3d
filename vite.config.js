import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the built site works from any GitHub Pages path.
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  build: {
    target: 'es2020',
  },
});
